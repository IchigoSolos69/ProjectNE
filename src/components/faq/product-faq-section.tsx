import Link from "next/link";
import { FaqAccordion } from "@/components/faq/faq-accordion";

export function ProductFaqSection() {
  return (
    <section className="mt-20 border-t border-stone-200 pt-16">
      <div className="max-w-2xl">
        <h2 className="font-serif text-2xl text-stone-900">Questions & answers</h2>
        <p className="mt-2 text-sm text-stone-600">
          Care, shipping, and returns — answered for every order.
        </p>
      </div>
      <div className="mt-8">
        <FaqAccordion collapsible showArrow />
      </div>
      <p className="mt-6 text-sm text-stone-500">
        <Link href="/faq" className="underline underline-offset-4 hover:text-stone-900">
          View all FAQs
        </Link>
      </p>
    </section>
  );
}
