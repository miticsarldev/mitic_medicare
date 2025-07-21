import { OrangeMoneyContext } from "@/contexts/OrangeMoneyContext";
import { useContext } from "react";

export const useOrangeMoney = () => {
  const context = useContext(OrangeMoneyContext);
  if (!context) {
    throw new Error(
      "useOrangeMoney must be used within an OrangeMoneyProvider"
    );
  }
  return context;
};
