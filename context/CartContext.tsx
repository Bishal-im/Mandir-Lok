"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
    id: string; // Unique ID for the cart entry (UUID or timestamp)
    poojaId: string;
    poojaName: string;
    poojaEmoji: string;
    templeId: string;
    templeName: string;
    date: string;
    packageIndex: number | null;
    packageName?: string;
    packagePrice: number;
    packageMembers: number; // member count from pooja package
    offeringIds: string[];
    offerings: { id: string; name: string; price: number; emoji: string; quantity: number }[];
    totalPrice: number;
    selected: boolean;
    poojaImage?: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, "id" | "selected">) => void;
    removeFromCart: (itemId: string) => void;
    toggleSelectItem: (itemId: string) => void;
    clearCart: () => void;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Initial load from storage and backend
    useEffect(() => {
        const loadCart = async () => {
            // 1. Load from localStorage first (for immediate UI)
            const savedCart = localStorage.getItem("mandirlok_cart");
            let initialCart: CartItem[] = [];
            if (savedCart) {
                try {
                    initialCart = JSON.parse(savedCart);
                } catch (e) {
                    console.error("Failed to parse cart", e);
                }
            }

            // 2. Load from backend if possible
            try {
                const res = await fetch("/api/cart/sync");
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data) {
                        // Backend is source of truth for logged-in users
                        initialCart = data.data.map((item: any) => ({
                            ...item,
                            date: item.date.split('T')[0],
                        }));
                    }
                }
            } catch (e) {
                console.error("Failed to fetch cart from backend", e);
            }

            setCart(initialCart);
            setIsInitialLoad(false);
        };

        loadCart();
    }, []);

    // Save to localStorage and sync with backend on change
    useEffect(() => {
        if (isInitialLoad) return; // Don't sync until we've loaded initial state

        // 1. Limit local cart size to prevent quota overflow
        let cartToStore = cart;
        if (cart.length > 50) {
            cartToStore = cart.slice(-50); // Keep only the latest 50 items locally
        }

        // 2. Safely save to localStorage
        try {
            localStorage.setItem("mandirlok_cart", JSON.stringify(cartToStore));
        } catch (e: any) {
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                console.warn("Storage quota exceeded. Clearing older data and relying on backend.");
                // Fallback: Clear the oldest half of the cart to make room
                try {
                    localStorage.removeItem("mandirlok_cart");
                    localStorage.setItem("mandirlok_cart", JSON.stringify(cart.slice(-20)));
                } catch (retryError) {
                    console.error("Critical storage failure:", retryError);
                }
            } else {
                console.error("Storage error:", e);
            }
        }

        // 3. Sync with backend (Always attempt, backend will ignore if not logged in)
        const syncCart = async () => {
            try {
                await fetch("/api/cart/sync", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cartItems: cart }),
                });
            } catch (e) {
                // Silently fail sync for guest users
            }
        };

        syncCart();
    }, [cart, isInitialLoad]);

    const addToCart = (item: Omit<CartItem, "id" | "selected">) => {
        const newItem: CartItem = {
            ...item,
            id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            selected: true,
        };
        setCart((prev) => [...prev, newItem]);
    };

    const toggleSelectItem = (itemId: string) => {
        setCart((prev) =>
            prev.map((item) =>
                item.id === itemId ? { ...item, selected: !item.selected } : item
            )
        );
    };

    const removeFromCart = (itemId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== itemId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartCount = cart.length;

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, toggleSelectItem, clearCart, cartCount }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
