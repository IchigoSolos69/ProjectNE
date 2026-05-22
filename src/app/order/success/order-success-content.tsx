"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const order = searchParams.get("order");

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <h1 className="font-serif text-3xl text-foreground">Thank you</h1>
      <p className="mt-4 text-muted-foreground">
        Your payment was received. We&apos;ll confirm shipping once your order is
        manifested with our courier partner.
      </p>
      {order && (
        <p className="mt-2 text-sm text-muted-foreground">Order ID: {order}</p>
      )}
      <Button className="mt-10" asChild>
        <Link href="/">Continue shopping</Link>
      </Button>
    </div>
  );
}
