import Image from "next/image";
import Link from "next/link";
import { siteName } from "@/lib/site";
export function Brand() {
  return (
    <Link href="/" className="brand">
      <Image
        src="/images/fox-river-logo.webp"
        alt={siteName}
        width={1073}
        height={367}
        sizes="260px"
        className="brand-logo"
      />
    </Link>
  );
}
