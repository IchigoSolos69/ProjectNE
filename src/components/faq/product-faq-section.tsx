import Link from "next/link";
import { FaqAccordion } from "@/components/faq/faq-accordion";

export function ProductFaqSection() {
  return (
    <section className="mt-20 border-t border-border pt-16">
      <div className="max-w-2xl">
        <h2 className="font-serif text-2xl text-foreground">Questions & answers</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Care, shipping, and returns — answered for every order.
        </p>
      </div>
      <div className="mt-8">
        <FaqAccordion collapsible showArrow />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        <Link href="/faq" className="underline underline-offset-4 hover:text-foreground">
          View all FAQs
        </Link>
      </p>
    </section>
  );
}
