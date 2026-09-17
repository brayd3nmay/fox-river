import type { SiteContent } from "@/lib/content-schema";
import Link from "next/link";
import { Phone, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { Button } from "./ui/button";
import { formatPrice, phoneHref } from "@/lib/format";
export function RatesPage({ content: c }: { content: SiteContent }) {
  return (
    <>
      <SiteHeader phone={c.contact.phone} />
      <main id="main" className="container-wide">
        <div className="page-intro">
          <p className="eyebrow">
            A little planning. A lot to look forward to.
          </p>
          <h1 className="display">Your stay, your way.</h1>
          <p className="body-copy">
            Choose a weekend getaway, a cabin retreat, or a whole season by the
            river. Call our office to check availability and make a reservation.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-6">
            <Button asChild>
              <a href={phoneHref(c.contact.phone)}>
                <Phone size={15} />
                {c.contact.phone}
              </a>
            </Button>
            <span className="text-xs text-muted-foreground">
              Season: {c.contact.season}
            </span>
          </div>
        </div>
        <nav className="rate-nav" aria-label="Rate categories">
          {c.rateGroups.map((group) => (
            <a key={group.id} href={`#${group.id}`}>
              {group.title}
            </a>
          ))}
        </nav>
        {c.rateGroups.map((group) => (
          <section id={group.id} key={group.id} className="full-rate-group">
            <div>
              <h2 className="display">{group.title}</h2>
              <p className="body-copy mt-4 text-sm">{group.description}</p>
            </div>
            <div>
              {group.rates.map((rate) => (
                <div key={rate.id} className="full-rate-row">
                  <div>
                    <h3>{rate.name}</h3>
                    {rate.note && <p>{rate.note}</p>}
                  </div>
                  <div className="price">
                    {formatPrice(rate.amount)}
                    <small>{rate.unit}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        <div className="callout">
          <h2 className="display text-3xl">A few things before you pack.</h2>
          <p className="body-copy my-4 text-sm">
            Cabins require a two-night minimum, deposit, and ID. Check-in is at
            3 pm or later and check-out is at 1 pm. Please review the
            reservation and visitor policies before your stay.
          </p>
          <Link href="/rules" className="text-link">
            Read the visiting guide <ArrowUpRight />
          </Link>
        </div>
        <div className="py-10 text-center">
          <p className="display text-3xl">
            Not sure which spot is right for you?
          </p>
          <a href={phoneHref(c.contact.phone)} className="text-link mt-5">
            We&apos;re happy to help. Call {c.contact.phone} <ArrowUpRight />
          </a>
        </div>
      </main>
      <SiteFooter contact={c.contact} />
    </>
  );
}
