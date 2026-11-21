// One-off: gives every existing product a per-size/colour stock grid.
// Run once:  node scripts/migrateVariants.js
// Each product's current total stock is spread evenly over its size × colour
// combinations. Adjust the real numbers afterwards in Admin → Products → Edit.
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const products = await Product.find({
            $or: [{ variants: { $exists: false } }, { variants: { $size: 0 } }],
        });

        let changed = 0;

        for (const product of products) {
            const sizes = product.sizes?.length ? product.sizes : [""];
            const colors = product.colors?.length ? product.colors : [""];
            const combos = [];

            for (const size of sizes) {
                for (const color of colors) combos.push({ size, color, stock: 0 });
            }

            let left = product.stock || 0;
            for (let i = 0; left > 0; i = (i + 1) % combos.length) {
                combos[i].stock += 1;
                left -= 1;
            }

            product.variants = combos;
            await product.save();
            changed += 1;
        }

        console.log(`Variants created for ${changed} product(s).`);
    } catch (error) {
        console.error("Migration failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

migrate();
