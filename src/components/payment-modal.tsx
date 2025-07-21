"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CreditCard,
  Smartphone,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useOrangeMoney } from "@/hooks/useOrangeMoney";
import {
  PaymentFormData,
  PaymentMethod,
} from "@/app/dashboard/independant_doctor/settings/pricing/actions";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency: string;
  title: string;
  description: string;
  onPaymentSuccess: (
    transactionId: string,
    paymentMethod: PaymentMethod
  ) => void;
  onPaymentError: (error: string) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  amount,
  currency,
  title,
  description,
  onPaymentSuccess,
  onPaymentError,
}: PaymentModalProps) {
  const { initializePayment, checkTransactionStatus, isLoading } =
    useOrangeMoney();
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("MOBILE_MONEY");
  const [formData, setFormData] = useState<PaymentFormData>({
    method: "MOBILE_MONEY",
    phoneNumber: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "form" | "processing" | "success" | "error"
  >("form");

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const validateForm = (): boolean => {
    if (paymentMethod === "MOBILE_MONEY") {
      if (!formData.phoneNumber || formData.phoneNumber.length < 8) {
        toast.error("Veuillez entrer un numéro de téléphone valide");
        return false;
      }
    } else if (paymentMethod === "CREDIT_CARD") {
      if (!formData.cardNumber || formData.cardNumber.length < 16) {
        toast.error("Veuillez entrer un numéro de carte valide");
        return false;
      }
      if (!formData.expiryDate || !formData.cvv || !formData.cardholderName) {
        toast.error("Veuillez remplir tous les champs de la carte");
        return false;
      }
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setProcessing(true);
    setPaymentStep("processing");

    try {
      const orderId = `sub_${Date.now()}`;
      const referenceId = `ref_${Date.now()}`;
      console.log({ amount });

      if (paymentMethod === "MOBILE_MONEY") {
        // Utiliser Orange Money
        const paymentResponse = await initializePayment(
          amount,
          orderId,
          referenceId
        );

        console.log(paymentResponse);

        if (paymentResponse.payment_url) {
          // Ouvrir l'URL de paiement dans une nouvelle fenêtre
          const paymentWindow = window.open(
            paymentResponse.payment_url,
            "_blank",
            "width=600,height=700"
          );

          // Vérifier le statut du paiement périodiquement
          const checkStatus = setInterval(async () => {
            try {
              const statusResponse = await checkTransactionStatus(
                orderId,
                amount,
                paymentResponse.pay_token
              );

              if (statusResponse.status === "SUCCESS") {
                clearInterval(checkStatus);
                paymentWindow?.close();
                setPaymentStep("success");
                onPaymentSuccess(statusResponse.txnid, "MOBILE_MONEY");
                toast.success("Paiement réussi !");
                setTimeout(() => {
                  onClose();
                  resetForm();
                }, 2000);
              } else if (statusResponse.status === "FAILED") {
                clearInterval(checkStatus);
                paymentWindow?.close();
                setPaymentStep("error");
                onPaymentError("Le paiement a échoué");
                toast.error("Le paiement a échoué");
              }
            } catch (error) {
              console.error("Erreur lors de la vérification du statut:", error);
            }
          }, 3000);

          // Arrêter la vérification après 10 minutes
          setTimeout(() => {
            clearInterval(checkStatus);
            if (paymentWindow && !paymentWindow.closed) {
              paymentWindow.close();
            }
          }, 600000);
        }
      } else {
        // Simuler le paiement par carte (à remplacer par votre processeur de paiement)
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Simuler un succès (remplacez par votre logique de paiement par carte)
        const transactionId = `card_${Date.now()}`;
        setPaymentStep("success");
        onPaymentSuccess(transactionId, "CREDIT_CARD");
        toast.success("Paiement par carte réussi !");
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      }
    } catch (error) {
      console.error("Erreur de paiement:", error);
      setPaymentStep("error");
      onPaymentError(
        error instanceof Error ? error.message : "Erreur de paiement"
      );
      toast.error("Erreur lors du paiement");
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      method: "MOBILE_MONEY",
      phoneNumber: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
    });
    setPaymentMethod("MOBILE_MONEY");
    setPaymentStep("form");
    setProcessing(false);
  };

  const handleClose = () => {
    if (!processing) {
      onClose();
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        {paymentStep === "form" && (
          <div className="space-y-6">
            {/* Résumé du paiement */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">
                  Résumé du paiement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Montant à payer</span>
                  <span className="text-2xl font-bold text-white">
                    {formatCurrency(amount, currency)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Sélection du mode de paiement */}
            <div className="space-y-4">
              <Label className="text-white font-medium">Mode de paiement</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => {
                  setPaymentMethod(value as PaymentMethod);
                  setFormData({ ...formData, method: value as PaymentMethod });
                }}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                  <RadioGroupItem value="MOBILE_MONEY" id="mobile" />
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <Smartphone className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <Label
                        htmlFor="mobile"
                        className="text-white font-medium cursor-pointer"
                      >
                        Orange Money
                      </Label>
                      <p className="text-sm text-gray-400">
                        Paiement via mobile money
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                  <RadioGroupItem value="CREDIT_CARD" id="card" />
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <CreditCard className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <Label
                        htmlFor="card"
                        className="text-white font-medium cursor-pointer"
                      >
                        Carte bancaire
                      </Label>
                      <p className="text-sm text-gray-400">Visa, Mastercard</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <Separator className="bg-gray-700" />

            {/* Formulaire de paiement */}
            <div className="space-y-4">
              {paymentMethod === "MOBILE_MONEY" ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone" className="text-white">
                      Numéro de téléphone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Ex: +225 07 XX XX XX XX"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <p className="text-sm text-orange-300">
                      Vous serez redirigé vers Orange Money pour finaliser le
                      paiement.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardName" className="text-white">
                      Nom du titulaire
                    </Label>
                    <Input
                      id="cardName"
                      type="text"
                      placeholder="Nom complet"
                      value={formData.cardholderName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cardholderName: e.target.value,
                        })
                      }
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardNumber" className="text-white">
                      Numéro de carte
                    </Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, cardNumber: e.target.value })
                      }
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry" className="text-white">
                        Date d&apos;expiration
                      </Label>
                      <Input
                        id="expiry"
                        type="text"
                        placeholder="MM/AA"
                        value={formData.expiryDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expiryDate: e.target.value,
                          })
                        }
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-white">
                        CVV
                      </Label>
                      <Input
                        id="cvv"
                        type="text"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={(e) =>
                          setFormData({ ...formData, cvv: e.target.value })
                        }
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-gray-700 text-gray-300 bg-transparent"
              >
                Annuler
              </Button>
              <Button
                onClick={handlePayment}
                disabled={processing || isLoading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {processing || isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  `Payer ${formatCurrency(amount, currency)}`
                )}
              </Button>
            </div>
          </div>
        )}

        {paymentStep === "processing" && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Traitement du paiement
            </h3>
            <p className="text-gray-400">
              Veuillez patienter pendant que nous traitons votre paiement...
            </p>
          </div>
        )}

        {paymentStep === "success" && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Paiement réussi !
            </h3>
            <p className="text-gray-400">
              Votre abonnement a été mis à jour avec succès.
            </p>
          </div>
        )}

        {paymentStep === "error" && (
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Paiement échoué
            </h3>
            <p className="text-gray-400 mb-4">
              Une erreur s&apos;est produite lors du traitement de votre
              paiement.
            </p>
            <Button
              onClick={() => setPaymentStep("form")}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Réessayer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
