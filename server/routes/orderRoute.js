import express from "express";
import Order from "../models/Order.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { auth } from "../middleware/tokenMiddleware.js";

const router = express.Router();

// Create a new order
router.post("/", auth, async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      street,
      city,
      state,
      zipcode,
      country,
      phone,
      items,
      paymentMethod,
      totalAmount,
      shippingFee,
    } = req.body;

    const newOrder = new Order({
      userId: req.user.id,
      firstName,
      lastName,
      email,
      street,
      city,
      state,
      zipcode,
      country,
      phone,
      items,
      paymentMethod,
      totalAmount,
      shippingFee,
    });

    const savedOrder = await newOrder.save();
    res
      .status(201)
      .json({ message: "Order placed successfully", order: savedOrder });
  } catch (err) {
    next(err);
  }
});

// Get all orders
router.get("/", auth, isAdmin, async (req, res, next) => {
  try {
    const orders = await Order.find().populate("items.id");
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// Get orders by user Id
router.get("/myOrders", auth, async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).populate(
      "items.id"
    );
    if (!orders) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// edit orderStatus
router.put("/:orderId/status", auth, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    next(err);
  }
});

// Delete an order by ID
router.delete("/:orderId", auth, isAdmin, async (req, res, next) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.orderId);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
