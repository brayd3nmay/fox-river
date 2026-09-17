"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Expand } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import type { SiteContent } from "@/lib/content-schema";

export function Gallery({ images }: { images: SiteContent["gallery"] }) {
  const [active, setActive] = useState<number | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const navigate = (delta: number) =>
    setActive((value) =>
      value === null ? null : (value + delta + images.length) % images.length,
    );
  return (
    <>
      <div className="gallery-grid">
        {images.map((image, index) => (
          <button
            key={`${image.src}-${index}`}
            type="button"
            className="photo-wrap"
            onClick={(event) => {
              lastTrigger.current = event.currentTarget;
              setActive(index);
            }}
            aria-label={`View photo: ${image.alt}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 800px) 50vw, 25vw"
              className="photo"
            />
            <span className="gallery-caption">
              <Expand className="ml-auto" size={16} />
            </span>
          </button>
        ))}
      </div>
      <Dialog
        open={active !== null}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
      >
        <DialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            lastTrigger.current?.focus();
          }}
          className="max-w-[92vw] gap-3 sm:max-w-5xl"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") navigate(1);
            if (event.key === "ArrowLeft") navigate(-1);
          }}
        >
          <DialogTitle className="pr-6 font-serif text-xl">
            A few moments from the river
          </DialogTitle>
          <DialogDescription>
            {active !== null ? images[active].alt : "Campground photo gallery"}
          </DialogDescription>
          {active !== null && (
            <div className="relative h-[65vh]">
              <Image
                src={images[active].src}
                alt={images[active].alt}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              aria-label="Previous photo"
              className="rounded border p-3"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={18} />
            </button>
            <span className="text-xs" aria-live="polite">
              {(active ?? 0) + 1} of {images.length}
            </span>
            <button
              aria-label="Next photo"
              className="rounded border p-3"
              onClick={() => navigate(1)}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
