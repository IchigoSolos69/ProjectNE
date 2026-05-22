import { Suspense } from "react";
import { OrderSuccessContent } from "./order-success-content";

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-stone-500">Loading…</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
