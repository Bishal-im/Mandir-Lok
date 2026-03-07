"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getCountryCode } from "@/lib/actions/geo";
import { getSettings } from "@/lib/actions/admin";

type Currency = "INR" | "USD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRate: number;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("INR");
  const [exchangeRate, setExchangeRate] = useState<number>(83);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initCurrency = async () => {
      // 1. Fetch Exchange Rate from DB
      try {
        const rateSetting = await getSettings("usd_exchange_rate");
        if (rateSetting && rateSetting.value) {
          setExchangeRate(Number(rateSetting.value));
        }
      } catch (err) {
        console.error("Failed to fetch exchange rate:", err);
      }

      // 2. Check localStorage for preference
      const saved = localStorage.getItem("mandirlok_currency") as Currency;
      if (saved && (saved === "INR" || saved === "USD")) {
        setCurrencyState(saved);
        setIsLoading(false);
        return;
      }

      // 3. Detect via geo action
      try {
        const country = await getCountryCode();
        const detectedCurrency: Currency = country === "IN" ? "INR" : "USD";
        setCurrencyState(detectedCurrency);
        localStorage.setItem("mandirlok_currency", detectedCurrency);
      } catch (err) {
        console.error("Failed to detect country:", err);
        setCurrencyState("INR"); // Default fallback
      } finally {
        setIsLoading(false);
      }
    };

    initCurrency();
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("mandirlok_currency", newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRate, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
