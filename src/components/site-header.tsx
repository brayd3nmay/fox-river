"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Menu, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { phoneHref } from "@/lib/format";
import { Brand } from "./brand";

const links = [
  { label: "Stay with us", href: "/#stay" },
  { label: "Explore the park", href: "/#amenities" },
  { label: "Rates", href: "/rates" },
  { label: "Gallery", href: "/#gallery" },
];
export function SiteHeader({ phone }: { phone: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="announcement">
        A FAMILY-OWNED CAMPGROUND. A RIVER FULL OF POSSIBILITIES.
      </div>
      <div className="container-wide site-nav">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          <a className="nav-call" href={phoneHref(phone)}>
            Plan your stay <ArrowUpRight size={15} />
          </a>
        </nav>
        <div className="mobile-nav">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="p-2" aria-label="Open navigation">
              <Menu size={26} />
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogTitle className="font-serif text-3xl">
                Make yourself at home.
              </DialogTitle>
              <DialogDescription>
                Explore Fox River Recreation.
              </DialogDescription>
              <nav
                className="flex flex-col gap-5 py-5"
                aria-label="Mobile navigation"
              >
                {[
                  ...links,
                  { label: "Rules & visiting", href: "/rules" },
                  { label: "Find us", href: "/#visit" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="border-b pb-3"
                  >
                    {link.label}
                  </Link>
                ))}
                <a href={phoneHref(phone)} className="flex items-center gap-3">
                  <Phone size={18} />
                  {phone}
                </a>
              </nav>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
