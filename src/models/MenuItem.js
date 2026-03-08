import mongoose from "mongoose";
import { FALLBACK_MENU_IMAGE } from "@/lib/menuImage";

const MenuItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Item name is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: 0,
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            enum: ["Starters", "Main Course", "Desserts", "Drinks", "Specials"],
            trim: true,
        },
        imageURL: {
            type: String,
            required: [true, "Image URL is required"],
            trim: true,
            default: FALLBACK_MENU_IMAGE,
        },
        // Additional images to show in item gallery (preferred). Keep single `imageURL` for
        // backward-compatibility but prefer `imageURLs` when present.
        imageURLs: {
            type: [String],
            default: [FALLBACK_MENU_IMAGE],
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        // Variants represent selectable sizes/quantities that modify base price
        variants: {
            type: [
                new mongoose.Schema(
                    {
                        id: { type: String, required: true },
                        label: { type: String, required: true },
                        // multiplier applied to base price (e.g. 0.5 for half kg, 1 for full kg)
                        priceMultiplier: { type: Number, default: 1, min: 0 },
                    },
                    { _id: false }
                ),
            ],
            default: [],
        },
        // Options are add-ons (e.g. bottle, extra naan) with fixed price
        options: {
            type: [
                new mongoose.Schema(
                    {
                        id: { type: String, required: true },
                        label: { type: String, required: true },
                        price: { type: Number, required: true, min: 0 },
                    },
                    { _id: false }
                ),
            ],
            default: [],
        },
    },
    { timestamps: true }
);

// Index category and name for faster filtered/sorted queries
MenuItemSchema.index({ category: 1, name: 1 });

export default mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);
