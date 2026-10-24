
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

const products = [
    {
        name: "Essential Cotton T-Shirt",
        description: "A comfortable everyday cotton T-shirt.",
        price: 799,
        category: "Women",
        subcategory: "T-Shirts",
        images: [],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Ivory", "Black"],
        stock: 25,
        isFeatured: true,
        isPublished: true
    },
    {
        name: "Relaxed Fit Shirt",
        description: "A versatile shirt with a relaxed silhouette.",
        price: 1499,
        category: "Women",
        subcategory: "Shirts",
        images: [],
        sizes: ["S", "M", "L", "XL"],
        colors: ["White", "Blue"],
        stock: 15,
        isFeatured: true,
        isPublished: true
    },
    {
        name: "Straight Fit Trousers",
        description: "Timeless trousers designed for everyday wear.",
        price: 1799,
        category: "Women",
        subcategory: "Trousers",
        images: [],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Beige", "Black"],
        stock: 12,
        isFeatured: false,
        isPublished: true
    },
    {
        name: "Classic Crew Neck T-Shirt",
        description: "A clean, versatile T-shirt for daily styling.",
        price: 799,
        category: "Men",
        subcategory: "T-Shirts",
        images: [],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "White"],
        stock: 30,
        isFeatured: true,
        isPublished: true
    },
    {
        name: "Oxford Casual Shirt",
        description: "A smart casual shirt for work and weekends.",
        price: 1599,
        category: "Men",
        subcategory: "Shirts",
        images: [],
        sizes: ["S", "M", "L", "XL"],
        colors: ["White", "Blue"],
        stock: 18,
        isFeatured: true,
        isPublished: true
    },
    {
        name: "Everyday Straight Fit Trousers",
        description: "Easy-to-style trousers with a timeless fit.",
        price: 1899,
        category: "Men",
        subcategory: "Trousers",
        images: [],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Charcoal", "Beige"],
        stock: 20,
        isFeatured: false,
        isPublished: true
    }
];

async function seedProducts() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        for (const item of products) {
            await Product.updateOne(
                { name: item.name, category: item.category },
                { $setOnInsert: item },
                { upsert: true, runValidators: true }
            );
        }

        console.log("HAVEN sample products added successfully!");
        console.log(`Products processed: ${products.length}`);
    } catch (error) {
        console.error("Seeding failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seedProducts();
