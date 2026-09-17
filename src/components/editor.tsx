"use client";
import { useId, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Eye,
  LoaderCircle,
  LogOut,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Brand } from "./brand";
import { previewPages, type PreviewPage } from "./preview-pages";
import {
  contentSchema,
  validationMessage,
  type SiteContent,
} from "@/lib/content-schema";
import { stayLabel } from "@/lib/format";
import { createClient } from "@/lib/supabase/browser";
import { saveDraft, publishDraft, signOut } from "@/app/admin/actions";

function Field({
  label,
  value,
  onChange,
  multiline = false,
  type = "text",
  hint,
  step,
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
  hint?: string;
  step?: string;
  min?: string;
}) {
  const id = useId();
  return (
    <div className="admin-field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          step={type === "number" ? (step ?? "0.01") : undefined}
          min={type === "number" ? min : undefined}
        />
      )}
      {hint && <small>{hint}</small>}
    </div>
  );
}

const mediaKinds = {
  image: {
    types: {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/avif": "avif",
    } as Record<string, string>,
    maxMb: 10,
    hint: "JPG, PNG, WebP, or AVIF, up to 10 MB.",
  },
  video: {
    types: { "video/mp4": "mp4", "video/webm": "webm" } as Record<
      string,
      string
    >,
    maxMb: 50,
    hint: "MP4 or WebM, up to 50 MB. Use a short, compressed clip.",
  },
};

function MediaUpload({
  onUpload,
  video = false,
  demo = false,
  label = "Upload replacement",
}: {
  onUpload: (url: string) => void;
  video?: boolean;
  demo?: boolean;
  label?: string;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { types, maxMb, hint } = mediaKinds[video ? "video" : "image"];
  async function upload(file: File) {
    setError("");
    if (!types[file.type]) {
      setError("Choose a supported file format.");
      return;
    }
    if (file.size > maxMb * 1024 * 1024) {
      setError(`Choose a file smaller than ${maxMb} MB.`);
      return;
    }
    setBusy(true);
    try {
      const client = createClient();
      const {
        data: { user },
      } = await client.auth.getUser();
      if (!user) throw new Error("Sign in again before uploading.");
      const path = `${user.id}/${crypto.randomUUID()}.${types[file.type]}`;
      const { error: uploadError } = await client.storage
        .from("site-media")
        .upload(path, file, {
          upsert: false,
          contentType: file.type,
          cacheControl: "31536000",
        });
      if (uploadError)
        throw new Error(
          "Upload failed. Check your owner access, file format, and connection.",
        );
      onUpload(
        client.storage.from("site-media").getPublicUrl(path).data.publicUrl,
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Upload failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <label
        htmlFor={id}
        className={`inline-flex items-center gap-2 rounded border px-3 py-2 text-xs font-medium ${demo || busy ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-muted"}`}
      >
        {busy ? (
          <LoaderCircle size={14} className="animate-spin" />
        ) : (
          <Upload size={14} />
        )}
        {busy ? "Uploading…" : label}
      </label>
      <input
        className="sr-only"
        id={id}
        type="file"
        accept={Object.keys(types).join(",")}
        disabled={demo || busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.target.value = "";
        }}
      />
      <p className="mt-2 text-xs text-muted-foreground">
        {demo
          ? "Uploads become available when owner sign-in is connected."
          : hint}
      </p>
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function PhotoField({
  image,
  onChange,
  demo,
}: {
  image: { src: string; alt: string };
  onChange: (image: { src: string; alt: string }) => void;
  demo: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
      <div className="relative aspect-[4/3] overflow-hidden rounded bg-muted">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="150px"
          className="object-cover"
        />
      </div>
      <div className="space-y-4">
        <MediaUpload
          demo={demo}
          onUpload={(src) => onChange({ ...image, src })}
        />
        <Field
          label="Photo description"
          value={image.alt}
          onChange={(alt) => onChange({ ...image, alt })}
          hint="Describe what is in the photo for people using screen readers."
        />
      </div>
    </div>
  );
}

export function Editor({
  initialContent,
  initialVersion,
  publishedVersion,
  ownerEmail,
  demo = false,
}: {
  initialContent: SiteContent;
  initialVersion: number;
  publishedVersion: number;
  ownerEmail: string;
  demo?: boolean;
}) {
  const [content, setContent] = useState(initialContent);
  const [version, setVersion] = useState(initialVersion);
  const [liveVersion, setLiveVersion] = useState(publishedVersion);
  const [dirty, setDirty] = useState(false);
  // One banner at a time: storing this as two strings meant every setter had
  // to remember to clear its twin.
  const [message, setMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const notify = (text: string) => setMessage({ ok: true, text });
  const fail = (text: string) => setMessage({ ok: false, text });
  const [pending, startTransition] = useTransition();
  const [publishOpen, setPublishOpen] = useState(false);
  const [preview, setPreview] = useState<PreviewPage | null>(null);
  function update(change: (draft: SiteContent) => void) {
    setContent((previous) => {
      const next = structuredClone(previous);
      change(next);
      return next;
    });
    setDirty(true);
    setMessage(null);
  }
  function save() {
    setMessage(null);
    const parsed = contentSchema.safeParse(content);
    if (!parsed.success) {
      fail(validationMessage(parsed.error, content));
      return;
    }
    startTransition(async () => {
      if (demo) {
        try {
          localStorage.setItem(
            "fox-river-editor-draft",
            JSON.stringify(parsed.data),
          );
          setDirty(false);
          setVersion((value) => value + 1);
          notify(
            "Draft saved in this browser. The public website is unchanged.",
          );
        } catch {
          fail(
            "This browser couldn't save the draft. Your changes are still here.",
          );
        }
        return;
      }
      const result = await saveDraft(parsed.data, version);
      if (result.ok) {
        setVersion(result.version);
        setDirty(false);
        notify("Draft saved. Preview it before publishing.");
      } else fail(result.error);
    });
  }
  function publish() {
    if (demo || dirty) return;
    startTransition(async () => {
      const result = await publishDraft(version);
      if (result.ok) {
        setLiveVersion(version);
        notify("Published. Your updates are now on the website.");
        setPublishOpen(false);
      } else {
        fail(result.error);
        setPublishOpen(false);
      }
    });
  }
  if (preview) {
    const PreviewPageComponent = previewPages[preview];
    return (
      <>
        <div className="preview-bar sticky top-0 z-50 flex flex-wrap items-center justify-center gap-4 p-3 text-xs">
          <button
            className="inline-flex items-center gap-2 underline"
            onClick={() => setPreview(null)}
          >
            <ArrowLeft size={14} />
            Back to editing
          </button>
          <strong>Preview · {dirty ? "Unsaved changes" : "Saved draft"}</strong>
          {(Object.keys(previewPages) as PreviewPage[]).map((page) => (
            <button
              key={page}
              className={`rounded px-3 py-1 capitalize ${preview === page ? "preview-bar-active" : "border border-white/40"}`}
              onClick={() => setPreview(page)}
            >
              {page}
            </button>
          ))}
        </div>
        <PreviewPageComponent content={content} />
      </>
    );
  }
  return (
    <div className="min-h-screen bg-[#f0f1e8]">
      <header className="border-b bg-background px-5 py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-4">
            <Brand />
            <span className="text-xs text-muted-foreground">Owner editor</span>
          </div>
          <div className="flex items-center gap-5 text-xs">
            <span>{ownerEmail}</span>
            {!demo && (
              <form action={signOut}>
                <button className="flex items-center gap-2">
                  <LogOut size={14} />
                  Sign out
                </button>
              </form>
            )}
            <Link href="/" target="_blank" className="flex items-center gap-2">
              View website <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">
        {demo && (
          <div className="mb-8 rounded border border-[#ccd5bc] bg-[#e5ebd9] p-4 text-sm leading-6">
            <strong>Local editor preview.</strong> Try editing content, save a
            draft in this browser, and preview your changes. Publishing and
            uploads require owner sign-in.{" "}
            <button
              className="ml-2 underline underline-offset-4"
              onClick={() => {
                try {
                  const saved = localStorage.getItem("fox-river-editor-draft");
                  if (!saved) {
                    notify("No local draft has been saved yet.");
                    return;
                  }
                  const restored = contentSchema.parse(JSON.parse(saved));
                  setContent(restored);
                  setDirty(false);
                  notify("Saved local draft restored.");
                } catch {
                  fail("The local draft couldn't be restored.");
                }
              }}
            >
              Restore saved local draft
            </button>
          </div>
        )}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="eyebrow mb-3">Keep things fresh</p>
            <h1 className="display text-4xl">Welcome back.</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Edit a little. Preview it. Publish when it&apos;s ready.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setPreview("home")}>
              <Eye size={15} />
              Preview
            </Button>
            <Button
              variant="outline"
              onClick={save}
              disabled={pending || (!dirty && version > 0)}
            >
              {pending ? (
                <LoaderCircle className="animate-spin" size={15} />
              ) : (
                <Save size={15} />
              )}
              Save draft
            </Button>
            <Button
              onClick={() => setPublishOpen(true)}
              disabled={
                demo ||
                dirty ||
                pending ||
                version === 0 ||
                version === liveVersion
              }
            >
              Publish changes
            </Button>
          </div>
        </div>
        <div className="mb-5 flex flex-wrap items-center gap-4 text-xs">
          <span
            className={`flex items-center gap-2 ${dirty ? "text-[#985231]" : "text-muted-foreground"}`}
          >
            <span
              className={`h-2 w-2 rounded-full ${dirty ? "bg-[#a75b38]" : "bg-[#698058]"}`}
            />
            {dirty
              ? "Unsaved changes"
              : version > 0
                ? "Draft saved"
                : "Ready to edit"}
          </span>
          {!demo && (
            <span className="text-muted-foreground">
              Draft version {version} · Published version {liveVersion}
            </span>
          )}
        </div>
        {message && (
          <p
            role={message.ok ? "status" : "alert"}
            className={
              message.ok
                ? "mb-5 flex items-center gap-2 rounded border bg-[#e7eddd] p-4 text-sm"
                : "mb-5 rounded border border-destructive/30 bg-red-50 p-4 text-sm text-destructive"
            }
          >
            {message.ok && <Check size={16} />}
            {message.text}
          </p>
        )}
        <fieldset disabled={pending} className="min-w-0">
          <Tabs defaultValue="homepage">
            <TabsList className="mb-7 h-auto w-full justify-start overflow-x-auto bg-transparent p-0 pb-2">
              {[
                "homepage",
                "rates",
                "photos",
                "amenities",
                "reviews",
                "rules",
                "contact",
              ].map((tab) => (
                <TabsTrigger key={tab} value={tab} className="px-4 py-3">
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="homepage" className="space-y-6">
              <section className="admin-panel">
                <h2>The first impression</h2>
                <div className="grid gap-5">
                  <Field
                    label="Location line"
                    value={content.hero.eyebrow}
                    onChange={(value) =>
                      update((c) => {
                        c.hero.eyebrow = value;
                      })
                    }
                  />
                  <Field
                    label="Main headline"
                    value={content.hero.title}
                    onChange={(value) =>
                      update((c) => {
                        c.hero.title = value;
                      })
                    }
                  />
                  <Field
                    label="Short introduction"
                    multiline
                    value={content.hero.description}
                    onChange={(value) =>
                      update((c) => {
                        c.hero.description = value;
                      })
                    }
                  />
                </div>
              </section>
              <section className="admin-panel">
                <h2>Welcome to the campground</h2>
                <div className="grid gap-5">
                  <Field
                    label="Small heading"
                    value={content.intro.eyebrow}
                    onChange={(value) =>
                      update((c) => {
                        c.intro.eyebrow = value;
                      })
                    }
                  />
                  <Field
                    label="Welcome headline"
                    multiline
                    value={content.intro.title}
                    onChange={(value) =>
                      update((c) => {
                        c.intro.title = value;
                      })
                    }
                  />
                  <Field
                    label="About Fox River"
                    multiline
                    value={content.intro.body}
                    onChange={(value) =>
                      update((c) => {
                        c.intro.body = value;
                      })
                    }
                  />
                </div>
              </section>
              <section className="admin-panel">
                <h2>Ways to stay</h2>
                <div className="space-y-8">
                  {content.stays.map((stay, i) => (
                    <div className="grid gap-4 border-t pt-5" key={stay.id}>
                      <h3>{stayLabel(stay)}</h3>
                      <Field
                        label="Headline"
                        value={stay.title}
                        onChange={(value) =>
                          update((c) => {
                            c.stays[i].title = value;
                          })
                        }
                      />
                      <Field
                        label="Description"
                        multiline
                        value={stay.description}
                        onChange={(value) =>
                          update((c) => {
                            c.stays[i].description = value;
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </section>
              <section className="admin-panel">
                <h2>Life on the river</h2>
                <div className="grid gap-5">
                  <Field
                    label="River headline"
                    multiline
                    value={content.river.title}
                    onChange={(value) =>
                      update((c) => {
                        c.river.title = value;
                      })
                    }
                  />
                  <Field
                    label="River description"
                    multiline
                    value={content.river.body}
                    onChange={(value) =>
                      update((c) => {
                        c.river.body = value;
                      })
                    }
                  />
                </div>
              </section>
            </TabsContent>
            <TabsContent value="rates" className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Prices update everywhere they appear. Leave the price blank to
                show “Please call.”
              </p>
              {content.rateGroups.map((group, gi) => (
                <section className="admin-panel" key={group.id}>
                  <h2>{group.title}</h2>
                  <Field
                    label={`${group.title} introduction`}
                    value={group.description}
                    multiline
                    onChange={(value) =>
                      update((c) => {
                        c.rateGroups[gi].description = value;
                      })
                    }
                  />
                  <div className="mt-6 space-y-5">
                    {group.rates.map((rate, ri) => (
                      <div
                        key={rate.id}
                        className="grid items-end gap-4 border-t pt-5 sm:grid-cols-[2fr_1fr_1fr]"
                      >
                        <Field
                          label="Rate name"
                          value={rate.name}
                          onChange={(value) =>
                            update((c) => {
                              c.rateGroups[gi].rates[ri].name = value;
                            })
                          }
                        />
                        <Field
                          label="Price in dollars"
                          type="number"
                          min="0"
                          value={
                            rate.amount === null ? "" : String(rate.amount)
                          }
                          onChange={(value) =>
                            update((c) => {
                              c.rateGroups[gi].rates[ri].amount =
                                value === "" ? null : Number(value);
                            })
                          }
                        />
                        <Field
                          label="Per night / week / season"
                          value={rate.unit}
                          onChange={(value) =>
                            update((c) => {
                              c.rateGroups[gi].rates[ri].unit = value;
                            })
                          }
                        />
                        <div className="sm:col-span-3">
                          <Field
                            label="Additional details"
                            value={rate.note}
                            onChange={(value) =>
                              update((c) => {
                                c.rateGroups[gi].rates[ri].note = value;
                              })
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </TabsContent>
            <TabsContent value="photos" className="space-y-6">
              <section className="admin-panel">
                <h2>Homepage hero</h2>
                <PhotoField
                  demo={demo}
                  image={content.hero.image}
                  onChange={(image) =>
                    update((c) => {
                      c.hero.image = image;
                    })
                  }
                />
                <div className="mt-8 border-t pt-6">
                  <h3>Drone video</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    The hero photo appears while the video loads or when a
                    visitor prefers reduced motion.
                  </p>
                  <MediaUpload
                    demo={demo}
                    video
                    label={
                      content.hero.video
                        ? "Replace drone video"
                        : "Upload drone video"
                    }
                    onUpload={(url) =>
                      update((c) => {
                        c.hero.video = url;
                      })
                    }
                  />
                  {content.hero.video && (
                    <div className="mt-4">
                      <video
                        src={content.hero.video}
                        controls
                        muted
                        className="max-h-64 w-full rounded"
                      />
                      <Button
                        variant="outline"
                        className="mt-3"
                        onClick={() =>
                          update((c) => {
                            c.hero.video = "";
                          })
                        }
                      >
                        Use photo only
                      </Button>
                    </div>
                  )}
                </div>
              </section>
              <section className="admin-panel">
                <h2>Stay photos</h2>
                <div className="space-y-8">
                  {content.stays.map((stay, i) => (
                    <div key={stay.id}>
                      <h3>{stay.title}</h3>
                      <PhotoField
                        demo={demo}
                        image={stay.image}
                        onChange={(image) =>
                          update((c) => {
                            c.stays[i].image = image;
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </section>
              <section className="admin-panel">
                <h2>River photo</h2>
                <PhotoField
                  demo={demo}
                  image={content.river.image}
                  onChange={(image) =>
                    update((c) => {
                      c.river.image = image;
                    })
                  }
                />
              </section>
              <section className="admin-panel">
                <h2>Photo gallery</h2>
                <div className="space-y-8">
                  {content.gallery.map((image, i) => (
                    <div key={i} className="border-b pb-6">
                      <PhotoField
                        demo={demo}
                        image={image}
                        onChange={(next) =>
                          update((c) => {
                            c.gallery[i] = next;
                          })
                        }
                      />
                      <div className="mt-3 flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={i === 0}
                          onClick={() =>
                            update((c) => {
                              [c.gallery[i - 1], c.gallery[i]] = [
                                c.gallery[i],
                                c.gallery[i - 1],
                              ];
                            })
                          }
                        >
                          Move earlier
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={content.gallery.length <= 1}
                          onClick={() =>
                            update((c) => {
                              c.gallery.splice(i, 1);
                            })
                          }
                        >
                          <Trash2 size={14} />
                          Remove from gallery
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {content.gallery.length < 24 && (
                  <div className="mt-6">
                    <MediaUpload
                      demo={demo}
                      label="Add a gallery photo"
                      onUpload={(src) =>
                        update((c) => {
                          c.gallery.push({
                            src,
                            alt: "Fox River Recreation campground",
                          });
                        })
                      }
                    />
                  </div>
                )}
              </section>
            </TabsContent>
            <TabsContent value="amenities" className="space-y-6">
              {content.amenities.map((amenity, i) => (
                <section className="admin-panel" key={amenity.id}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Amenity name"
                      value={amenity.name}
                      onChange={(value) =>
                        update((c) => {
                          c.amenities[i].name = value;
                        })
                      }
                    />
                    <Field
                      label="Short description"
                      value={amenity.detail}
                      onChange={(value) =>
                        update((c) => {
                          c.amenities[i].detail = value;
                        })
                      }
                    />
                  </div>
                </section>
              ))}
            </TabsContent>
            <TabsContent value="reviews" className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Keep the guest&apos;s wording and attribution accurate when
                editing a review.
              </p>
              {content.reviews.map((review, i) => (
                <section className="admin-panel" key={i}>
                  <div className="grid gap-5">
                    <Field
                      label="Guest name"
                      value={review.name}
                      onChange={(value) =>
                        update((c) => {
                          c.reviews[i].name = value;
                        })
                      }
                    />
                    <Field
                      label="Guest review"
                      multiline
                      value={review.quote}
                      onChange={(value) =>
                        update((c) => {
                          c.reviews[i].quote = value;
                        })
                      }
                    />
                  </div>
                </section>
              ))}
            </TabsContent>
            <TabsContent value="rules" className="space-y-6">
              <section className="admin-panel">
                <h2>Before guests arrive</h2>
                <p className="mb-5 text-sm leading-7 text-muted-foreground">
                  Add the complete, approved campground rules here. Until then,
                  the visiting guide asks guests to contact the office for the
                  full policy.
                </p>
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={content.parkRulesComplete}
                    onChange={(event) =>
                      update((c) => {
                        c.parkRulesComplete = event.target.checked;
                      })
                    }
                    className="mt-1"
                  />
                  The complete park rules are included below and have been
                  checked.
                </label>
              </section>
              {content.rules.map((rule, i) => (
                <section className="admin-panel" key={i}>
                  <div className="grid gap-5">
                    <Field
                      label="Rule heading"
                      value={rule.title}
                      onChange={(value) =>
                        update((c) => {
                          c.rules[i].title = value;
                        })
                      }
                    />
                    <Field
                      label="Policy wording"
                      multiline
                      value={rule.body}
                      onChange={(value) =>
                        update((c) => {
                          c.rules[i].body = value;
                        })
                      }
                    />
                    <Button
                      variant="ghost"
                      className="justify-self-start"
                      onClick={() =>
                        update((c) => {
                          c.rules.splice(i, 1);
                        })
                      }
                    >
                      <Trash2 size={14} />
                      Remove section
                    </Button>
                  </div>
                </section>
              ))}
              <Button
                variant="outline"
                disabled={content.rules.length >= 30}
                onClick={() =>
                  update((c) => {
                    c.rules.push({
                      title: "New rule",
                      body: "Add the approved policy wording here.",
                    });
                  })
                }
              >
                <Plus size={15} />
                Add a rule section
              </Button>
            </TabsContent>
            <TabsContent value="contact">
              <section className="admin-panel">
                <h2>Help guests find you</h2>
                <div className="grid gap-5">
                  <Field
                    label="Office phone"
                    value={content.contact.phone}
                    onChange={(value) =>
                      update((c) => {
                        c.contact.phone = value;
                      })
                    }
                    hint="Use 847-395-6090 format. All call links update automatically."
                  />
                  <Field
                    label="Contact email"
                    type="email"
                    value={content.contact.email}
                    onChange={(value) =>
                      update((c) => {
                        c.contact.email = value;
                      })
                    }
                  />
                  <Field
                    label="Street address"
                    value={content.contact.address.street}
                    onChange={(value) =>
                      update((c) => {
                        c.contact.address.street = value;
                      })
                    }
                  />
                  <div className="grid gap-5 sm:grid-cols-[2fr_1fr_1fr]">
                    <Field
                      label="City"
                      value={content.contact.address.city}
                      onChange={(value) =>
                        update((c) => {
                          c.contact.address.city = value;
                        })
                      }
                    />
                    <Field
                      label="State"
                      value={content.contact.address.region}
                      onChange={(value) =>
                        update((c) => {
                          c.contact.address.region = value.toUpperCase();
                        })
                      }
                      hint="Two letters, like IL."
                    />
                    <Field
                      label="ZIP code"
                      value={content.contact.address.postalCode}
                      onChange={(value) =>
                        update((c) => {
                          c.contact.address.postalCode = value;
                        })
                      }
                    />
                  </div>
                  <Field
                    label="Camping season"
                    value={content.contact.season}
                    onChange={(value) =>
                      update((c) => {
                        c.contact.season = value;
                      })
                    }
                  />
                  <Field
                    label="Languages spoken"
                    value={content.contact.languages}
                    onChange={(value) =>
                      update((c) => {
                        c.contact.languages = value;
                      })
                    }
                  />
                </div>
              </section>
              <section className="admin-panel">
                <h2>Search listings</h2>
                <p className="text-sm text-muted-foreground">
                  These tell Google that this website, the map pin, and the
                  business listing all belong to the same campground. Leave a
                  field blank if you do not have it yet.
                </p>
                <div className="mt-5 grid gap-5">
                  <Field
                    label="Facebook page link"
                    value={content.contact.facebookUrl}
                    onChange={(value) =>
                      update((c) => {
                        c.contact.facebookUrl = value.trim();
                      })
                    }
                    hint="Blank hides the Facebook links on the website."
                  />
                  <Field
                    label="Google Business Profile link"
                    value={content.contact.googleProfileUrl}
                    onChange={(value) =>
                      update((c) => {
                        c.contact.googleProfileUrl = value.trim();
                      })
                    }
                    hint="The share link from your Google business listing."
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Map latitude"
                      type="number"
                      step="0.000001"
                      value={
                        content.contact.geo.latitude === null
                          ? ""
                          : String(content.contact.geo.latitude)
                      }
                      onChange={(value) =>
                        update((c) => {
                          c.contact.geo.latitude =
                            value === "" ? null : Number(value);
                        })
                      }
                      hint="Right-click the office in Google Maps to copy both numbers."
                    />
                    <Field
                      label="Map longitude"
                      type="number"
                      step="0.000001"
                      value={
                        content.contact.geo.longitude === null
                          ? ""
                          : String(content.contact.geo.longitude)
                      }
                      onChange={(value) =>
                        update((c) => {
                          c.contact.geo.longitude =
                            value === "" ? null : Number(value);
                        })
                      }
                      hint="Fill in both, or leave both blank."
                    />
                  </div>
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </fieldset>
        <p className="mt-8 text-xs text-muted-foreground">
          {demo
            ? "Local drafts stay in this browser. They cannot change the live website."
            : "Saving keeps a private draft. Publishing updates the public website."}
        </p>
      </main>
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent>
          <DialogTitle>Ready to share your updates?</DialogTitle>
          <DialogDescription>
            Publishing makes saved draft version {version} visible to all
            visitors. Check the preview first to make sure the photos, rates,
            and wording look right.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => setPublishOpen(false)}
            >
              Keep editing
            </Button>
            <Button disabled={pending} onClick={publish}>
              {pending ? "Publishing…" : "Publish to website"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
