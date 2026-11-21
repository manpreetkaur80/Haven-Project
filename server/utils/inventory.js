const Product = require("../models/Product");

const fail = (message, statusCode) =>
    Object.assign(new Error(message), { statusCode });

/**
 * Takes `quantity` units out of stock inside a transaction.
 * Products with variants are tracked per size + colour; older products
 * (no variants) just use the single `stock` number.
 * Throws a 409 if there isn't enough left.
 */
async function reserveStock(product, { size, color, quantity }, session) {
    if (product.variants?.length) {
        const variant = product.variants.find(
            (v) => v.size === size && v.color === color
        );

        if (!variant) {
            throw fail(`That size/colour isn't available for ${product.name}.`, 400);
        }

        if (variant.stock < quantity) {
            throw fail(
                variant.stock === 0
                    ? `${product.name} (${[size, color].filter(Boolean).join(", ")}) is sold out.`
                    : `Only ${variant.stock} left of ${product.name} (${[size, color].filter(Boolean).join(", ")}).`,
                409
            );
        }

        // Conditional update = two shoppers can't both take the last item.
        const result = await Product.updateOne(
            {
                _id: product._id,
                isPublished: true,
                variants: { $elemMatch: { size, color, stock: { $gte: quantity } } }
            },
            { $inc: { "variants.$.stock": -quantity, stock: -quantity } },
            { session }
        );

        if (result.modifiedCount !== 1) {
            throw fail(`Stock for ${product.name} has changed. Please review your bag.`, 409);
        }
        return;
    }

    // Legacy product without variants.
    if (quantity > product.stock) {
        throw fail(`${product.name} does not have enough stock.`, 409);
    }

    const result = await Product.updateOne(
        { _id: product._id, isPublished: true, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { session }
    );

    if (result.modifiedCount !== 1) {
        throw fail(`Stock for ${product.name} has changed. Please review your bag.`, 409);
    }
}

/** Puts an order line's quantity back (cancelled order / failed payment). */
async function restoreStock(item, session) {
    const product = await Product.findById(item.product).session(session);

    if (!product) {
        throw fail(`Product "${item.name}" could not be found. Stock restoration failed.`, 409);
    }

    if (product.variants?.length) {
        const result = await Product.updateOne(
            {
                _id: product._id,
                variants: { $elemMatch: { size: item.size || "", color: item.color || "" } }
            },
            { $inc: { "variants.$.stock": item.quantity, stock: item.quantity } },
            { session }
        );

        // If that size/colour was removed from the product meanwhile, there is nowhere to put it back.
        return result;
    }

    await Product.updateOne(
        { _id: product._id },
        { $inc: { stock: item.quantity } },
        { session }
    );
}

module.exports = { reserveStock, restoreStock };
