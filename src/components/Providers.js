"use client";

import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/app/auth/auth-context";

export default function Providers({ children }) {
    return (
        <AuthProvider>
            <CartProvider>
                {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: "#2a2a2a",
                        color: "#f5f0eb",
                        border: "1px solid #3a3a3a",
                    },
                    success: {
                        iconTheme: { primary: "#d4a853", secondary: "#1a1a1a" },
                    },
                    error: {
                        iconTheme: { primary: "#f87171", secondary: "#1a1a1a" },
                    },
                }}
            />
            </CartProvider>
        </AuthProvider>
    );
}
