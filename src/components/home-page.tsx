import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  ArrowRight,
  Trees,
  Waves,
  Ship,
  Tent,
  Store,
  ShowerHead,
  Wifi,
  Volleyball,
  Utensils,
  Fuel,
  MapPin,
  Phone,
  Mail,
  CalendarDays,
  Quote,
  Anchor,
  Fish,
  Sailboat,
} from "lucide-react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { Hero } from "./hero";
import { Gallery } from "./gallery";
import { Button } from "./ui/button";
import {
  formatAddress,
  formatPrice,
  mapsHref,
  phoneHref,
  rateIndex,
  stayHref,
  stayLabel,
} from "@/lib/format";
import type { AmenityIcon, SiteContent } from "@/lib/content-schema";
// Typed by the schema's icon enum, so adding a name there fails the build here.
const icons: Record<AmenityIcon, LucideIcon> = {
  waves: Waves,
  trees: Trees,
  boat: Ship,
  tent: Tent,
  store: Store,
  shower: ShowerHead,
  wifi: Wifi,
  games: Volleyball,
  picnic: Utensils,
  fuel: Fuel,
};

export function HomePage({ content: c }: { content: SiteContent }) {
  const rates = rateIndex(c);
  // The schema guarantees every stay.rateId resolves, so these never go missing.
  const highlightRates = c.stays
    .map((stay) => rates.get(stay.rateId))
    .filter((rate) => rate !== undefined);
  return (
    <>
      <SiteHeader phone={c.contact.phone} />
      <main id="main">
        <Hero content={c.hero} />
        <section id="welcome" className="section-pad container-wide intro-grid">
          <div>
            <p className="eyebrow mb-5">{c.intro.eyebrow}</p>
            <h2 className="display section-title whitespace-pre-line">
              {c.intro.title}
            </h2>
          </div>
          <p className="body-copy">{c.intro.body}</p>
        </section>
        <section id="stay" className="container-wide pb-24">
          <div className="section-heading">
            <div>
              <p className="eyebrow mb-4">Stay a night. Stay a while.</p>
              <h2 className="display section-title">Find your place here.</h2>
            </div>
            <Link href="/rates" className="text-link">
              All stays & rates <ArrowUpRight />
            </Link>
          </div>
          <div className="stay-grid">
            {c.stays.map((stay, i) => {
              const rate = rates.get(stay.rateId);
              const href = stayHref(stay);
              const label = stayLabel(stay);
              return (
                <article key={stay.id}>
                  <Link href={href} className="photo-wrap stay-photo block">
                    <Image
                      src={stay.image.src}
                      alt={stay.image.alt}
                      fill
                      sizes="(max-width: 520px) 100vw, 33vw"
                      className="photo"
                    />
                    <span className="photo-tag">
                      0{i + 1} / {label}
                    </span>
                  </Link>
                  <div className="stay-body">
                    <h3 className="display">{stay.title}</h3>
                    <p>{stay.description}</p>
                    <div className="stay-price">
                      <span>
                        From{" "}
                        <strong>{formatPrice(rate?.amount ?? null)}</strong>{" "}
                        <span>{rate?.unit}</span>
                      </span>
                      <Link
                        href={href}
                        aria-label={`Explore ${label}`}
                        className="rounded-full border p-2"
                      >
                        <ArrowUpRight size={17} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        <section id="amenities" className="amenities-section section-pad">
          <div className="container-wide">
            <div className="section-heading">
              <div>
                <p className="eyebrow mb-4">Simple pleasures, all right here</p>
                <h2 className="display section-title">
                  More room for good days.
                </h2>
              </div>
            </div>
            <div className="amenity-grid">
              {c.amenities.map((amenity) => {
                const Icon = icons[amenity.icon];
                return (
                  <div key={amenity.id} className="amenity-item">
                    <Icon aria-hidden="true" />
                    <h3>{amenity.name}</h3>
                    <p>{amenity.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        <section className="river-section">
          <div className="photo-wrap river-photo">
            <Image
              src={c.river.image.src}
              alt={c.river.image.alt}
              fill
              sizes="(max-width: 800px) 100vw, 50vw"
              className="photo"
            />
          </div>
          <div className="river-copy">
            <h2 className="display section-title whitespace-pre-line">
              {c.river.title}
            </h2>
            <p className="body-copy">{c.river.body}</p>
            <div className="river-points">
              <span>
                <Anchor />
                Boat launch & docks
              </span>
              <span>
                <Sailboat />
                Canoe rentals
              </span>
              <span>
                <Fish />
                Fishing
              </span>
            </div>
            <Link href="/rates#water" className="text-link">
              Get out on the water <ArrowUpRight />
            </Link>
          </div>
        </section>
        <section className="section-pad container-wide rates-preview">
          <div>
            <h2 className="display section-title">
              Good times.
              <br />
              Clear prices.
            </h2>
            <p className="body-copy mt-6 max-w-sm">
              A weekend away or a season by the water. Find your stay, then give
              us a call to reserve your spot.
            </p>
            <Link href="/rates" className="text-link mt-7">
              See the complete rate guide <ArrowUpRight />
            </Link>
          </div>
          <div>
            {highlightRates.map((rate) => (
              <div key={rate.id} className="rate-preview-row">
                <div>
                  <h3>{rate.name}</h3>
                  <small>{rate.note}</small>
                </div>
                <p className="rate-preview-price">
                  {formatPrice(rate.amount)} <span>{rate.unit}</span>
                </p>
              </div>
            ))}
            <p className="mt-5 text-xs leading-6 text-muted-foreground">
              Cabins have a two-night minimum. Call for availability and help
              choosing your site.
            </p>
          </div>
        </section>
        <section id="gallery" className="pb-24 container-wide">
          <div className="section-heading">
            <div>
              <h2 className="display section-title">This is the good part.</h2>
            </div>
          </div>
          <Gallery images={c.gallery} />
        </section>
        <section className="section-pad border-y border-border bg-[#f0f0e6]">
          <div className="container-wide">
            <div className="mb-12 text-center">
              <h2 className="display section-title">
                Come for the river.
                <br />
                Stay for the people.
              </h2>
            </div>
            <div className="review-grid">
              {c.reviews.map((review) => (
                <blockquote key={review.name} className="review">
                  <Quote
                    className="text-[#7b8c65]"
                    size={25}
                    strokeWidth={1.3}
                    aria-hidden="true"
                  />
                  <p>“{review.quote}”</p>
                  <footer>
                    {review.name}{" "}
                    <span className="ml-2 normal-case tracking-normal text-muted-foreground">
                      · Guest review
                    </span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
        {c.contact.facebookUrl && (
          <section
            id="happenings"
            className="container-wide flex flex-wrap items-center justify-between gap-6 border-b py-12"
          >
            <div>
              <h2 className="display text-3xl">
                There&apos;s always a reason to get together.
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Find the latest park announcements and event updates on our
                Facebook page.
              </p>
            </div>
            <a
              href={c.contact.facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              See what&apos;s happening <ArrowUpRight />
            </a>
          </section>
        )}
        <section id="visit" className="section-pad container-wide visit-grid">
          <div>
            <h2 className="display section-title">
              A little out of the way.
              <br />
              Just where you want to be.
            </h2>
            <p className="body-copy mt-6">
              Find us in {c.contact.address.city}, Illinois, about 60 miles
              north of Chicago. Bring your people, pack for the outdoors, and
              let us help with the rest.
            </p>
            <Button asChild className="mt-7 h-12 rounded-sm px-6 text-xs">
              <a href={phoneHref(c.contact.phone)}>
                Let&apos;s plan your stay <ArrowUpRight size={16} />
              </a>
            </Button>
            <p className="mt-6 text-xs leading-6 text-muted-foreground">
              We speak {c.contact.languages}.
            </p>
          </div>
          <div className="visit-card">
            <div className="visit-row">
              <MapPin />
              <div>
                <h3>Find your way here</h3>
                <p>{formatAddress(c.contact.address)}</p>
                <a
                  href={mapsHref(c.contact.address)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 underline underline-offset-4"
                >
                  Get directions <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
            <div className="visit-row">
              <Phone />
              <div>
                <h3>Give us a call</h3>
                <a href={phoneHref(c.contact.phone)}>{c.contact.phone}</a>
              </div>
            </div>
            <div className="visit-row">
              <Mail />
              <div>
                <h3>Drop us a line</h3>
                <a className="break-all" href={`mailto:${c.contact.email}`}>
                  {c.contact.email}
                </a>
              </div>
            </div>
            <div className="visit-row">
              <CalendarDays />
              <div>
                <h3>Camping season</h3>
                <p>{c.contact.season}</p>
                <Link
                  href="/rules"
                  className="mt-2 inline-flex items-center gap-2 underline underline-offset-4"
                >
                  Before you visit <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter contact={c.contact} />
    </>
  );
}
