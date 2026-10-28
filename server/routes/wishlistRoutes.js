
const express = require("express");

const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
} = require("../controllers/wishlistController");

const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.get("/", getWishlist);
router.post("/:productId", addToWishlist);
router.delete("/:productId", removeFromWishlist);

module.exports = router;
