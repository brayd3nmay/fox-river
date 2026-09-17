"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, MapPin, Pause, Play } from "lucide-react";
import { Button } from "./ui/button";
import type { SiteContent } from "@/lib/content-schema";
export function Hero({ content }: { content: SiteContent["hero"] }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!content.video || !video.current) return;
    const player = video.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (preference.matches) player.pause();
      else player.play().catch(() => {});
    };
    apply();
    preference.addEventListener("change", apply);
    return () => preference.removeEventListener("change", apply);
  }, [content.video]);
  return (
    <section className="hero" aria-labelledby="hero-title">
      <Image
        className="hero-image"
        src={content.image.src}
        alt={content.image.alt}
        fill
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
      />
      {content.video && !failed && (
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setFailed(true)}
          aria-hidden="true"
        >
          <source src={content.video} />
        </video>
      )}
      <div className="container-wide hero-inner">
        <p className="eyebrow flex items-center gap-2">
          <MapPin size={13} />
          {content.eyebrow}
        </p>
        <h1 id="hero-title" className="display">
          {content.title}
        </h1>
        <p className="hero-description">{content.description}</p>
        <div className="hero-actions">
          <Button
            asChild
            className="h-12 rounded-sm bg-background px-6 text-xs text-primary hover:bg-white"
          >
            <Link href="/#stay">
              Find your getaway <ArrowUpRight size={16} />
            </Link>
          </Button>
          <Link href="/rates" className="text-link">
            Explore rates <ArrowUpRight />
          </Link>
        </div>
      </div>
      {content.video && !failed && (
        <div className="container-wide hero-bottom">
          <button
            onClick={() => {
              const v = video.current;
              if (!v) return;
              if (v.paused) v.play().catch(() => setFailed(true));
              else v.pause();
            }}
            className="flex items-center gap-2 p-2"
            aria-label={
              playing ? "Pause background video" : "Play background video"
            }
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            {playing ? "Pause" : "Play"}
          </button>
        </div>
      )}
    </section>
  );
}
