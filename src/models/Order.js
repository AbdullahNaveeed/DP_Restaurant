import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
    },
    name: String,
    price: Number,
    quantity: {
        type: Number,
        min: 1,
        default: 1,
    },
});

const OrderSchema = new mongoose.Schema(
    {
        customerName: {
            type: String,
            required: [true, "Customer name is required"],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
        },
        address: {
            type: String,
            required: [true, "Delivery address is required"],
            trim: true,
        },
        items: {
            type: [OrderItemSchema],
            required: true,
            validate: [(v) => v.length > 0, "At least one item is required"],
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentMethod: {
            type: String,
            enum: ["COD", "MockOnline"],
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Preparing", "Delivered"],
            default: "Pending",
        },
    },
    { timestamps: true }
);

// Indexes to speed up common admin/lookup queries
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
