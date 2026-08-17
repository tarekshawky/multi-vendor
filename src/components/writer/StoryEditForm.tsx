"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateStory } from "@/server/actions/stories";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { ImageUploadField } from "@/components/vendor/ImageUploadField";

type Story = {
  id: string;
  title: string;
  excerpt: string | null;
  body: string;
  coverImage: string | null;
  status: "DRAFT" | "PUBLISHED";
};

export function StoryEditForm({ story }: { story: Story }) {
  const t = useTranslations("WriterStories");
  const tc = useTranslations("AdminCommon");
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(story.status);
  const [saved, setSaved] = useState(false);

  function submitWithAction(action: "save" | "publish" | "unpublish") {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    formData.set("action", action);
    setSaved(false);
    startTransition(async () => {
      await updateStory(story.id, formData);
      setStatus(action === "publish" ? "PUBLISHED" : action === "unpublish" ? "DRAFT" : status);
      setSaved(true);
    });
  }

  return (
    <form ref={formRef} className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-4">
        <StatusPill label={status} tone={status === "PUBLISHED" ? "neutral" : "positive"} />
        {saved && !pending && <span className="text-sm text-on-surface-variant">{tc("saved")}</span>}
      </div>

      <div className="space-y-2">
        <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {t("fieldTitle")}
        </label>
        <Input type="text" name="title" defaultValue={story.title} required />
      </div>

      <div className="space-y-2">
        <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {t("coverImage")}
        </label>
        <ImageUploadField name="coverImage" defaultValue={story.coverImage} hint={t("coverImageHint")} />
      </div>

      <div className="space-y-2">
        <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {t("excerpt")}
        </label>
        <Textarea name="excerpt" rows={2} defaultValue={story.excerpt ?? ""} placeholder={t("excerptPlaceholder")} />
      </div>

      <div className="space-y-2">
        <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {t("body")}
        </label>
        <Textarea name="body" rows={14} defaultValue={story.body} placeholder={t("bodyPlaceholder")} />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="button" variant="secondary" disabled={pending} onClick={() => submitWithAction("save")}>
          {tc("saveChanges")}
        </Button>
        {status === "PUBLISHED" ? (
          <Button type="button" variant="secondary" disabled={pending} onClick={() => submitWithAction("unpublish")}>
            {t("unpublish")}
          </Button>
        ) : (
          <Button type="button" disabled={pending} onClick={() => submitWithAction("publish")}>
            {t("publish")}
          </Button>
        )}
      </div>
    </form>
  );
}
