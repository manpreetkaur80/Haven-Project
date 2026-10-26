
// const express = require("express");

// const {
//     getProducts,
//     getProductById,
//     createProduct
// } = require("../controllers/productController");

// const upload = require("../middleware/upload");

// const router = express.Router();

// // Get all published products
// router.get("/", getProducts);

// // Get a single published product
// router.get("/:id", getProductById);

// // Create a product and receive up to 5 images
// router.post(
//     "/",
//     upload.array("images", 5),
//     createProduct
// );

// module.exports = router;

const express = require("express");

const {
    getProducts,
    getProductById,
    createProduct
} = require("../controllers/productController");

const upload = require("../middleware/upload");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Public shopping pages
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin only: create products
router.post(
    "/",
    authenticate,
    requireAdmin,
    upload.array("images", 5),
    createProduct
);

module.exports = router;
