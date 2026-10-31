
const express = require("express");

const {
    getProducts,
    getProductById,
    createProduct,
    getAdminProducts,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

const upload = require("../middleware/upload");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Admin routes — keep these before the /:id route
router.get(
    "/admin/all",
    authenticate,
    requireAdmin,
    getAdminProducts
);

router.patch(
    "/admin/:id",
    authenticate,
    requireAdmin,
    upload.array("images", 5),
    updateProduct
);

router.delete(
    "/admin/:id",
    authenticate,
    requireAdmin,
    deleteProduct
);

// Public customer routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin: create product
router.post(
    "/",
    authenticate,
    requireAdmin,
    upload.array("images", 5),
    createProduct
);

module.exports = router;
