import React, { createContext, useState, useCallback } from "react";
import axios from "axios";
import {
  PaymentInitResponse,
  TokenData,
  TransactionStatusResponse,
} from "@/types";

interface OrangeMoneyContextType {
  initializePayment: (
    amount: number,
    orderId: string,
    referenceId: string
  ) => Promise<PaymentInitResponse>;
  checkTransactionStatus: (
    orderId: string,
    amount: number,
    payToken: string
  ) => Promise<TransactionStatusResponse>;
  isLoading: boolean;
}

export const OrangeMoneyContext = createContext<OrangeMoneyContextType | null>(
  null
);

export const OrangeMoneyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getAccess_token = useCallback(async () => {
    if (tokenData && tokenData.expires_in > Date.now()) {
      return tokenData;
    }

    const storedTokenData = localStorage.getItem("orangeMoneyTokenData");

    if (storedTokenData) {
      const parsedTokenData: TokenData = JSON.parse(storedTokenData);
      if (parsedTokenData.expires_in > Date.now()) {
        setTokenData(parsedTokenData);
        return parsedTokenData;
      }
    }

    // If no valid token is stored, request a new one
    return requestNewAccess_token();
  }, [tokenData]);

  const requestNewAccess_token = async () => {
    try {
      const response = await fetch("/api/orange-token", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Échec de récupération du token");
      }

      const data = await response.json();

      const newTokenData: TokenData = {
        access_token: data.access_token,
        expires_in: Date.now() + data.expires_in * 900,
        token_type: data.token_type,
      };

      localStorage.setItem(
        "orangeMoneyTokenData",
        JSON.stringify(newTokenData)
      );
      setTokenData(newTokenData);
      return newTokenData;
    } catch (error) {
      console.error("Error requesting new access token:", error);
      throw error;
    }
  };

  const initializePayment = async (
    amount: number,
    order_id?: string,
    reference_id?: string
  ) => {
    setIsLoading(true);
    const { access_token } = await getAccess_token();

    try {
      const response = await fetch("/api/orange-money/init-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          order_id,
          reference_id,
          access_token,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error("Erreur paiement Orange :", err.error);
      } else {
        const data = await response.json();
        console.log(data);
        console.log("✅ Paiement lancé :", data);
        return data;
      }
    } catch (error) {
      console.error("Error initializing payment:", error);
      if (axios.isAxiosError(error)) {
        console.error("API Error:", error.response?.data || error.message);
        alert("Payment initialization failed. Please try again.");
      } else {
        console.error("Unexpected Error:", error);
        alert("An unexpected error occurred.");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkTransactionStatus = async (
    orderId: string,
    amount: number,
    payToken: string
  ) => {
    setIsLoading(true);
    const { access_token } = await getAccess_token();

    try {
      const response = await axios.post(
        "https://api.orange.com/orange-money-webpay/dev/v1/transactionstatus",
        {
          order_id: orderId,
          amount: amount,
          pay_token: payToken,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error checking transaction status:", error);
      if (axios.isAxiosError(error)) {
        console.error("API Error:", error.response?.data || error.message);
      } else {
        console.error("Unexpected Error:", error);
        alert("An unexpected error occurred.");
      }
      throw error;
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrangeMoneyContext.Provider
      value={{ initializePayment, checkTransactionStatus, isLoading }}
    >
      {children}
    </OrangeMoneyContext.Provider>
  );
};
