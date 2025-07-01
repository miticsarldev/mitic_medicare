// OrangeMoneyButton.tsx
"use client";

import { useState } from "react";
import axios from "axios";

interface OrangeMoneyButtonProps {
  amount: number;
  orderId: string;
  returnUrl: string;
  cancelUrl: string;
  notifUrl: string;
}

export default function OrangeMoneyButton({
  amount,
  orderId,
  returnUrl,
  cancelUrl,
  notifUrl,
}: OrangeMoneyButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/orange-monney", {
        amount,
        orderId,
        returnUrl,
        cancelUrl,
        notifUrl,
      });

      if (res.data?.payment_url) {
        window.location.href = res.data.payment_url;
      } else {
        alert("Erreur de création du paiement");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'initialisation du paiement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
    >
      {loading ? "Redirection..." : "Payer avec Orange Money"}
    </button>
  );
}
