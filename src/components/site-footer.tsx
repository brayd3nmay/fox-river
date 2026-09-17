import Link from "next/link";
import { Brand } from "./brand";
import { formatAddress } from "@/lib/format";
import { siteName } from "@/lib/site";
import type { SiteContent } from "@/lib/content-schema";
export function SiteFooter({ contact }: { contact: SiteContent["contact"] }) {
  return (
    <footer className="footer">
      <div className="container-wide">
        <div className="footer-top">
          <div>
            <Brand />
            <p className="mt-5 text-xs text-[#bdcbb8]">
              Good days. Great company. Life by the river.
            </p>
          </div>
          <nav className="footer-links" aria-label="Footer navigation">
            <Link href="/rates">Rates</Link>
            <Link href="/rules">Park rules</Link>
            <Link href="/#visit">Find us</Link>
            {contact.facebookUrl && (
              <a href={contact.facebookUrl} target="_blank" rel="noreferrer">
                Facebook ↗
              </a>
            )}
          </nav>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {siteName} ·{" "}
            {formatAddress(contact.address)}
          </span>
          <span className="flex gap-5">
            <Link href="/privacy">Privacy</Link>
            <Link href="/admin">Owner sign-in</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
