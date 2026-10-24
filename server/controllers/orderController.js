
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");

const createOrder = async (req, res) => {
    const {
        customer,
        shippingAddress,
        items,
        paymentMethod
    } = req.body;

    // Validate required order information
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
            message: "Please provide complete customer and delivery details."
        });
    }

    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) ||
        !/^[6-9]\d{9}$/.test(customer.phone) ||
        !/^\d{6}$/.test(shippingAddress.pincode)
    ) {
        return res.status(400).json({
            message: "Please provide valid email, phone number, and PIN code."
        });
    }

    if (
        paymentMethod !== "COD" ||
        !Array.isArray(items) ||
        items.length === 0
    ) {
        return res.status(400).json({
            message: "A valid payment method and at least one item are required."
        });
    }

    // Validate cart items before opening a database transaction
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
                message: "One or more cart items are invalid."
            });
        }

        const size = item.size || "";
        const color = item.color || "";
        const key = `${item.productId}:${size}:${color}`;

        // Merge repeated requests for the same product variant
        const existing = requestedItems.get(key);

        if (existing) {
            existing.quantity += item.quantity;

            if (existing.quantity > 100) {
                return res.status(400).json({
                    message: "The requested quantity is too large."
                });
            }
        } else {
            requestedItems.set(key, {
                productId: item.productId,
                quantity: item.quantity,
                size,
                color
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
                    isPublished: true
                }).session(session);

                if (!product) {
                    throw Object.assign(
                        new Error("A selected product is unavailable."),
                        { statusCode: 404 }
                    );
                }

                if (requested.quantity > product.stock) {
                    throw Object.assign(
                        new Error(
                            `${product.name} does not have enough stock.`
                        ),
                        { statusCode: 409 }
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

                // Atomically reserve stock only if enough remains
                const stockUpdate = await Product.updateOne(
                    {
                        _id: product._id,
                        isPublished: true,
                        stock: { $gte: requested.quantity }
                    },
                    {
                        $inc: { stock: -requested.quantity }
                    },
                    { session }
                );

                if (stockUpdate.modifiedCount !== 1) {
                    throw Object.assign(
                        new Error(
                            `Stock for ${product.name} has changed. Please review your bag.`
                        ),
                        { statusCode: 409 }
                    );
                }

                // Always take the price and image from MongoDB
                const price = product.price;
                subtotal += price * requested.quantity;

                orderItems.push({
                    product: product._id,
                    name: product.name,
                    image: product.images?.[0]?.url || "",
                    price,
                    quantity: requested.quantity,
                    size: requested.size,
                    color: requested.color
                });
            }

            // Shipping is zero until a real shipping policy is configured
            const shippingFee = 0;

            const [order] = await Order.create(
                [
                    {
                        customer: {
                            fullName: customer.fullName.trim(),
                            email: customer.email.trim().toLowerCase(),
                            phone: customer.phone.trim()
                        },
                        shippingAddress: {
                            address: shippingAddress.address.trim(),
                            city: shippingAddress.city.trim(),
                            state: shippingAddress.state.trim(),
                            pincode: shippingAddress.pincode.trim()
                        },
                        items: orderItems,
                        subtotal,
                        shippingFee,
                        totalAmount: subtotal + shippingFee,
                        paymentMethod: "COD",
                        paymentStatus: "Pending",
                        orderStatus: "Placed"
                    }
                ],
                { session }
            );

            savedOrder = order;
        });

        return res.status(201).json({
            message: "Order placed successfully.",
            order: {
                _id: savedOrder._id,
                items: savedOrder.items,
                subtotal: savedOrder.subtotal,
                shippingFee: savedOrder.shippingFee,
                totalAmount: savedOrder.totalAmount,
                paymentMethod: savedOrder.paymentMethod,
                paymentStatus: savedOrder.paymentStatus,
                orderStatus: savedOrder.orderStatus,
                createdAt: savedOrder.createdAt
            }
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                message: error.message
            });
        }

        console.error("Order creation failed:", error);

        return res.status(500).json({
            message: "Unable to place your order. Please try again."
        });
    } finally {
        await session.endSession();
    }
};

module.exports = { createOrder };
