import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl text-stone-900">Checkout</h1>
      <p className="mt-2 text-stone-600">
        Secure payment via Razorpay. Shipping calculated by pincode.
      </p>
      <div className="mt-12">
        <CheckoutForm />
      </div>
    </div>
  );
}
