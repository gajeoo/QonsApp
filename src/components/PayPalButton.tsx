import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useAction } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";

interface PayPalButtonProps {
  plan: "starter" | "pro";
  clientId: string;
  onSuccess: () => void;
}

export function PayPalCheckoutButton({
  plan,
  clientId,
  onSuccess,
}: PayPalButtonProps) {
  const createOrder = useAction(api.paypal.createOrder);
  const captureOrder = useAction(api.paypal.captureOrder);
  const [processing, setProcessing] = useState(false);

  if (processing) {
    return (
      <div className="flex items-center justify-center py-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin mr-2" />
        Processing payment...
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "USD",
        intent: "capture",
      }}
    >
      <PayPalButtons
        style={{
          layout: "horizontal",
          color: "gold",
          shape: "rect",
          label: "paypal",
          height: 40,
          tagline: false,
        }}
        createOrder={async () => {
          const result = await createOrder({ plan });
          if (!result.orderId) {
            toast.error(result.error || "Failed to create PayPal order");
            throw new Error(result.error || "Failed to create order");
          }
          return result.orderId;
        }}
        onApprove={async (data) => {
          setProcessing(true);
          try {
            const result = await captureOrder({
              orderId: data.orderID,
              plan,
            });
            if (result.success) {
              toast.success("Payment successful! Your subscription is active.");
              onSuccess();
            } else {
              toast.error(result.error || "Payment failed");
            }
          } catch {
            toast.error("Failed to process payment");
          } finally {
            setProcessing(false);
          }
        }}
        onError={() => {
          toast.error("PayPal payment failed. Please try again.");
        }}
        onCancel={() => {
          toast.info("Payment cancelled");
        }}
      />
    </PayPalScriptProvider>
  );
}
