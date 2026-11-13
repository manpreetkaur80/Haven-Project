
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
    },
    {
        name: "Linen Blend Shirt",
        description: "A breathable linen-blend shirt with an easy, relaxed drape.",
        price: 1899,
        category: "Women",
        subcategory: "Shirts",
        images: [],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Sand", "White"],
        stock: 18,
        isFeatured: true,
        isPublished: true
    },
    {
        name: "Ribbed Knit Top",
        description: "A soft ribbed knit top that layers or stands on its own.",
        price: 1299,
        category: "Women",
        subcategory: "Knitwear",
        images: [],
        sizes: ["S", "M", "L"],
        colors: ["Taupe", "Ivory"],
        stock: 22,
        isFeatured: true,
        isPublished: true
    },
    {
        name: "Wide Leg Trousers",
        description: "Fluid wide-leg trousers with a clean, tailored waist.",
        price: 2199,
        category: "Women",
        subcategory: "Trousers",
        images: [],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Charcoal", "Stone"],
        stock: 14,
        isFeatured: false,
        isPublished: true
    },
    {
        name: "Heavyweight Cotton Tee",
        description: "A substantial everyday tee in dense, soft-washed cotton.",
        price: 999,
        category: "Men",
        subcategory: "T-Shirts",
        images: [],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Off-white", "Brown"],
        stock: 30,
        isFeatured: true,
        isPublished: true
    },
    {
        name: "Textured Knit Sweater",
        description: "A midweight textured sweater for easy, layered days.",
        price: 2499,
        category: "Men",
        subcategory: "Knitwear",
        images: [],
        sizes: ["M", "L", "XL"],
        colors: ["Oatmeal", "Charcoal"],
        stock: 12,
        isFeatured: true,
        isPublished: true
    },
    {
        name: "Relaxed Chino Trousers",
        description: "Relaxed-fit chinos in a smooth cotton twill.",
        price: 1999,
        category: "Men",
        subcategory: "Trousers",
        images: [],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Khaki", "Navy"],
        stock: 16,
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
