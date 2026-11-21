
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { reserveStock, restoreStock } = require("../utils/inventory");
const razorpay = require("../utils/razorpay");
const { sendEmail } = require("../utils/email");
const { orderPlacedEmail, orderStatusEmail } = require("../utils/emailTemplates");

const createOrder = async (req, res) => {
  const { customer, shippingAddress, items, paymentMethod } = req.body;

  // Authentication middleware must set req.user.
  if (!req.user?.userId) {
    return res.status(401).json({
      message: "Please log in before placing an order.",
    });
  }

  if (
    !customer?.fullName?.trim() ||
    !customer?.email?.trim() ||
    !customer?.phone?.trim() ||
    !shippingAddress?.address?.trim() ||
    !shippingAddress?.city?.trim() ||
    !shippingAddress?.state?.trim() ||
    !shippingAddress?.pincode?.trim()
  ) {
    return res.status(400).json({
      message: "Please provide complete customer and delivery details.",
    });
  }

  const email = customer.email.trim().toLowerCase();
  const phone = customer.phone.trim();
  const pincode = shippingAddress.pincode.trim();

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !/^[6-9]\d{9}$/.test(phone) ||
    !/^\d{6}$/.test(pincode)
  ) {
    return res.status(400).json({
      message: "Please provide valid email, phone number, and PIN code.",
    });
  }

  if (
    !["COD", "Razorpay"].includes(paymentMethod) ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({
      message: "A valid payment method and at least one item are required.",
    });
  }

  if (paymentMethod === "Razorpay" && !razorpay.isConfigured()) {
    return res.status(503).json({
      message: "Online payment is not available right now. Please choose Cash on Delivery.",
    });
  }

  const requestedItems = new Map();

  for (const item of items) {
    if (
      !item.productId ||
      !mongoose.isValidObjectId(item.productId) ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 100 ||
      (item.size != null && typeof item.size !== "string") ||
      (item.color != null && typeof item.color !== "string")
    ) {
      return res.status(400).json({
        message: "One or more cart items are invalid.",
      });
    }

    const size = item.size || "";
    const color = item.color || "";
    const key = `${item.productId}:${size}:${color}`;

    const existing = requestedItems.get(key);

    if (existing) {
      existing.quantity += item.quantity;

      if (existing.quantity > 100) {
        return res.status(400).json({
          message: "The requested quantity is too large.",
        });
      }
    } else {
      requestedItems.set(key, {
        productId: item.productId,
        quantity: item.quantity,
        size,
        color,
      });
    }
  }

  const session = await mongoose.startSession();

  try {
    let savedOrder;

    await session.withTransaction(async () => {
      const orderItems = [];
      let subtotal = 0;

      for (const requested of requestedItems.values()) {
        const product = await Product.findOne({
          _id: requested.productId,
          isPublished: true,
        }).session(session);

        if (!product) {
          throw Object.assign(
            new Error("A selected product is unavailable."),
            { statusCode: 404 }
          );
        }

        if (
          product.sizes?.length &&
          !product.sizes.includes(requested.size)
        ) {
          throw Object.assign(
            new Error(`Invalid size selected for ${product.name}.`),
            { statusCode: 400 }
          );
        }

        if (
          product.colors?.length &&
          !product.colors.includes(requested.color)
        ) {
          throw Object.assign(
            new Error(`Invalid color selected for ${product.name}.`),
            { statusCode: 400 }
          );
        }

        // Atomically take stock for this size + colour inside the transaction.
        await reserveStock(product, requested, session);

        // Price and image come from the database, not the browser.
        const price = product.price;
        subtotal += price * requested.quantity;

        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.images?.[0]?.url || "",
          price,
          quantity: requested.quantity,
          size: requested.size,
          color: requested.color,
        });
      }

      const shippingFee = 0;

      const [order] = await Order.create(
        [
          {
            // Link the order to the authenticated account.
            customerId: new mongoose.Types.ObjectId(req.user.userId),

            // Preserve the order-time contact information.
            customer: {
              fullName: customer.fullName.trim(),
              email,
              phone,
            },

            shippingAddress: {
              address: shippingAddress.address.trim(),
              city: shippingAddress.city.trim(),
              state: shippingAddress.state.trim(),
              pincode,
            },

            items: orderItems,
            subtotal,
            shippingFee,
            totalAmount: subtotal + shippingFee,
            paymentMethod,
            paymentStatus: "Pending",
            orderStatus: "Placed",
          },
        ],
        { session }
      );

      savedOrder = order;
    });

    // Online payment: ask Razorpay for a payment order the browser can open.
    let payment = null;

    if (paymentMethod === "Razorpay") {
      try {
        const rzpOrder = await razorpay.createRazorpayOrder({
          amount: savedOrder.totalAmount,
          receipt: savedOrder._id.toString(),
        });

        savedOrder.razorpayOrderId = rzpOrder.id;
        await savedOrder.save();

        payment = {
          keyId: process.env.RAZORPAY_KEY_ID,
          razorpayOrderId: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
        };
      } catch (paymentError) {
        console.error("Razorpay order creation failed:", paymentError.message);
        await releaseUnpaidOrder(savedOrder._id, "Failed");
        return res.status(502).json({
          message: "We couldn't start the payment. Please try again or choose Cash on Delivery.",
        });
      }
    } else {
      sendEmail({ to: savedOrder.customer.email, ...orderPlacedEmail(savedOrder) });
    }

    return res.status(201).json({
      message: "Order placed successfully.",
      payment,
      order: {
        _id: savedOrder._id,
        customer: savedOrder.customer,
        shippingAddress: savedOrder.shippingAddress,
        items: savedOrder.items,
        subtotal: savedOrder.subtotal,
        shippingFee: savedOrder.shippingFee,
        totalAmount: savedOrder.totalAmount,
        paymentMethod: savedOrder.paymentMethod,
        paymentStatus: savedOrder.paymentStatus,
        orderStatus: savedOrder.orderStatus,
        createdAt: savedOrder.createdAt,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    console.error("Order creation failed:", error);

    return res.status(500).json({
      message: "Unable to place your order. Please try again.",
    });
  } finally {
    await session.endSession();
  }
};


const cancelMyOrder = async (req, res) => {
    const { orderId } = req.params;

    if (!mongoose.isValidObjectId(orderId)) {
        return res.status(400).json({
            message: "Invalid order ID.",
        });
    }

    const session = await mongoose.startSession();

    try {
        let cancelledOrder;

        await session.withTransaction(async () => {
            // Find the order belonging to the logged-in customer.
            const order = await Order.findOne({
                _id: orderId,
                customerId: req.user.userId,
            }).session(session);

            if (!order) {
                throw Object.assign(
                    new Error("Order not found."),
                    { statusCode: 404 }
                );
            }

            if (order.orderStatus === "Cancelled") {
                throw Object.assign(
                    new Error("This order has already been cancelled."),
                    { statusCode: 409 }
                );
            }

            // Customers cannot cancel orders after shipment.
            const cancellableStatuses = [
                "Placed",
                "Confirmed",
                "Processing",
            ];

            if (!cancellableStatuses.includes(order.orderStatus)) {
                throw Object.assign(
                    new Error(
                        "This order can no longer be cancelled. Please use the return process if applicable."
                    ),
                    { statusCode: 409 }
                );
            }

            // Restore stock only if it has not already been restored.
            if (!order.stockRestored) {
                for (const item of order.items) {
                    await restoreStock(item, session);
                }

                order.stockRestored = true;
            }

            order.orderStatus = "Cancelled";

            await order.save({ session });

            cancelledOrder = order;
        });

        await refundIfPaidOnline(cancelledOrder);
        sendEmail({
            to: cancelledOrder.customer.email,
            ...orderStatusEmail(cancelledOrder),
        });

        return res.status(200).json({
            message: "Your order has been cancelled successfully.",
            order: cancelledOrder,
        });

    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error("Customer order cancellation error:", error);

        return res.status(500).json({
            message: "Unable to cancel your order. Please try again.",
        });

    } finally {
        await session.endSession();
    }
};


/**
 * Cancels an online order whose payment never completed and puts its stock back.
 * Safe to call more than once. Returns true if it released the order.
 */
async function releaseUnpaidOrder(orderId, paymentStatus = "Failed") {
    const session = await mongoose.startSession();
    let released = false;

    try {
        await session.withTransaction(async () => {
            released = false;
            const order = await Order.findOne({
                _id: orderId,
                paymentMethod: "Razorpay",
                paymentStatus: "Pending",
                orderStatus: "Placed",
            }).session(session);

            if (!order) return;

            if (!order.stockRestored) {
                for (const item of order.items) {
                    await restoreStock(item, session);
                }
                order.stockRestored = true;
            }

            order.orderStatus = "Cancelled";
            order.paymentStatus = paymentStatus;
            await order.save({ session });
            released = true;
        });
    } finally {
        await session.endSession();
    }

    return released;
}

/** If a customer paid online and the order is cancelled, send the money back. */
async function refundIfPaidOnline(order) {
    if (
        order.paymentMethod !== "Razorpay" ||
        order.paymentStatus !== "Paid" ||
        !order.razorpayPaymentId
    ) {
        return;
    }

    try {
        await razorpay.refundPayment(order.razorpayPaymentId, order.totalAmount);
        order.paymentStatus = "Refunded";
        await order.save();
    } catch (error) {
        // Leave it as Paid so the admin can see it still needs a manual refund.
        console.error(`Refund failed for order ${order._id}:`, error.message);
    }
}

module.exports = {
    createOrder,
    cancelMyOrder,
    releaseUnpaidOrder,
    refundIfPaidOnline,
};
