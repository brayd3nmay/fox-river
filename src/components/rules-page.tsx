import type { SiteContent } from "@/lib/content-schema";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { phoneHref } from "@/lib/format";
export function RulesPage({ content: c }: { content: SiteContent }) {
  return (
    <>
      <SiteHeader phone={c.contact.phone} />
      <main id="main" className="container-wide pb-16">
        <div className="page-intro">
          <p className="eyebrow">Make yourself at home</p>
          <h1 className="display">Before you visit.</h1>
          <p className="body-copy">
            A little preparation makes for a better stay. Here are the
            reservation and visiting details to know before you arrive.
          </p>
        </div>
        <div className="mx-auto max-w-4xl py-10">
          {c.rules.map((rule, index) => (
            <details className="rule-item" key={`${rule.title}-${index}`} open>
              <summary>{rule.title}</summary>
              <p className="body-copy">{rule.body}</p>
            </details>
          ))}
          {!c.parkRulesComplete && (
            <div className="callout">
              <h2 className="display text-2xl">Complete campground rules</h2>
              <p className="body-copy mt-3 text-sm">
                Please contact the office for the complete park rules, including
                policies for your particular site or stay. Our team can answer
                questions before you reserve.
              </p>
              <a href={phoneHref(c.contact.phone)} className="text-link mt-4">
                Call {c.contact.phone} <ArrowUpRight />
              </a>
            </div>
          )}
          <Link href="/rates" className="text-link mt-8">
            View rates & visitor fees <ArrowUpRight />
          </Link>
        </div>
      </main>
      <SiteFooter contact={c.contact} />
    </>
  );
}
