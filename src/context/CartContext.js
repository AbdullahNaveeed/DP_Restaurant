"use client";

import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext();

const initialState = {
    items: [],
    totalItems: 0,
    totalAmount: 0,
};

function cartReducer(state, action) {
    switch (action.type) {
        case "ADD_ITEM": {
            // Support adding multiple quantity at once via payload.quantity
            const qtyToAdd =
                typeof action.payload.quantity === "number" && action.payload.quantity > 0
                    ? Math.floor(action.payload.quantity)
                    : 1;

            const existingIndex = state.items.findIndex(
                (item) => item._id === action.payload._id
            );

            let newItems;
            if (existingIndex > -1) {
                newItems = state.items.map((item, i) =>
                    i === existingIndex
                        ? { ...item, quantity: item.quantity + qtyToAdd }
                        : item
                );
            } else {
                newItems = [...state.items, { ...action.payload, quantity: qtyToAdd }];
            }

            return calculateTotals({ ...state, items: newItems });
        }

        case "REMOVE_ITEM": {
            const newItems = state.items.filter(
                (item) => item._id !== action.payload
            );
            return calculateTotals({ ...state, items: newItems });
        }

        case "UPDATE_QUANTITY": {
            const { id, quantity } = action.payload;
            if (quantity < 1) {
                const newItems = state.items.filter((item) => item._id !== id);
                return calculateTotals({ ...state, items: newItems });
            }
            const newItems = state.items.map((item) =>
                item._id === id ? { ...item, quantity } : item
            );
            return calculateTotals({ ...state, items: newItems });
        }

        case "CLEAR_CART":
            return initialState;

        case "LOAD_CART":
            return action.payload;

        default:
            return state;
    }
}

function calculateTotals(state) {
    const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    return { ...state, totalItems, totalAmount };
}

export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem("restaurant_cart");
            if (saved) {
                dispatch({ type: "LOAD_CART", payload: JSON.parse(saved) });
            }
        } catch { }
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        try {
            localStorage.setItem("restaurant_cart", JSON.stringify(state));
        } catch { }
    }, [state]);

    const addItem = (item) => dispatch({ type: "ADD_ITEM", payload: item });
    const removeItem = (id) => dispatch({ type: "REMOVE_ITEM", payload: id });
    const updateQuantity = (id, quantity) =>
        dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
    const clearCart = () => dispatch({ type: "CLEAR_CART" });

    return (
        <CartContext.Provider
            value={{
                items: state.items,
                totalItems: state.totalItems,
                totalAmount: state.totalAmount,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
