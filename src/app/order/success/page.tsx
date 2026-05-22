import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const { order } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <h1 className="font-serif text-3xl text-stone-900">Thank you</h1>
      <p className="mt-4 text-stone-600">
        Your payment was received. We&apos;ll confirm shipping once your order is
        manifested with our courier partner.
      </p>
      {order && (
        <p className="mt-2 text-sm text-stone-500">Order ID: {order}</p>
      )}
      <Button className="mt-10" asChild>
        <Link href="/">Continue shopping</Link>
      </Button>
    </div>
  );
}
