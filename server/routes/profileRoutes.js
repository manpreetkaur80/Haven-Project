const express = require("express");
const {
  getMyProfile,
  updateMyProfile,
  getMyOrders,
  addMyAddress,
  updateMyAddress,
  deleteMyAddress,
} = require("../controllers/profileController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.get("/", getMyProfile);
router.patch("/", updateMyProfile);

router.get("/orders", getMyOrders);

router.post("/addresses", addMyAddress);
router.patch("/addresses/:addressId", updateMyAddress);
router.delete("/addresses/:addressId", deleteMyAddress);

module.exports = router;