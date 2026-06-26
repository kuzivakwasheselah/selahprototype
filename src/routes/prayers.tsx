import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  HandHeart,
  Pencil,
  Sparkles,
  Trash2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { usePrayers, useNow, type Prayer } from "@/lib/prayers-store";
import { generatePrayer } from "@/lib/prayer-gen";

export const Route = createFileRoute("/prayers")({
  head: () => ({
    meta: [
      { title: "Prayers — Selah" },
      { name: "description", content: "Write or request personal prayers and keep them close." },
    ],
  }),
  component: PrayersPage,
});

function PrayersPage() {
  const { acknowledgeRevealed } = usePrayers();

  // While viewing Prayers, mark answered prayers as seen so the nav badge clears.
  const ackRef = useRef(acknowledgeRevealed);
  ackRef.current = acknowledgeRevealed;
  useEffect(() => {
    ackRef.current();
    const id = setInterval(() => ackRef.current(), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto min-h-[100dvh] max-w-2xl px-5 pb-20 pt-20">
      <h1 className="flex items-center gap-2 text-3xl font-semibold text-foreground">
        <HandHeart className="h-6 w-6 text-primary" />
        Prayers
      </h1>

      <div className="mt-6">
        <PersonalTab />
      </div>
    </div>
  );
}

/* -------------------------------- Personal -------------------------------- */

function PersonalTab() {
  const { items, add, requestPrayer, update, remove } = usePrayers();
  const now = useNow(3000);
  const [editor, setEditor] = useState<{ mode: "write" | "request" | "edit"; prayer?: Prayer } | null>(null);

  const pending = items.filter((p) => p.revealAt && p.revealAt > now);
  const visible = items.filter((p) => !p.revealAt || p.revealAt <= now);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setEditor({ mode: "write" })}
          className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-4 text-sm font-medium transition hover:border-primary/40"
        >
          <Pencil className="h-4 w-4 text-primary" /> Write a prayer
        </button>
        <button
          type="button"
          onClick={() => setEditor({ mode: "request" })}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground transition hover:brightness-105"
        >
          <Sparkles className="h-4 w-4" /> Request
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {pending.map((p) => (
          <div
            key={p.id}
            className="flex items-start gap-3 rounded-2xl border border-dashed border-primary/40 bg-accent/40 p-4"
          >
            <Clock className="mt-0.5 h-5 w-5 shrink-0 animate-pulse text-primary" />
            <div>
              <h3 className="font-serif text-lg text-foreground">Your prayer request has been received</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                It will be answered shortly. We'll let you know the moment it's ready.
              </p>
            </div>
          </div>
        ))}

        {visible.length === 0 && pending.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            No prayers yet. Write your own or request one from Selah.
          </p>
        )}

        {visible.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setEditor({ mode: "edit", prayer: p })}
            className="block w-full rounded-2xl border border-border bg-card p-4 text-left transition hover:border-primary/40 hover:shadow-soft"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-serif text-lg text-foreground">{p.title}</h3>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                  p.source === "generated" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground",
                )}
              >
                {p.source === "generated" ? "Received" : "Written"}
              </span>
            </div>
            <p className="mt-1.5 whitespace-pre-line text-sm text-muted-foreground line-clamp-3">{p.body}</p>
          </button>
        ))}
      </div>

      {editor && (
        <PrayerEditor
          mode={editor.mode}
          prayer={editor.prayer}
          onClose={() => setEditor(null)}
          onRequest={(intention) => {
            const out = generatePrayer(intention);
            requestPrayer(out);
            toast.success("Your prayer request has been received and will be answered shortly.");
            setEditor(null);
          }}
          onSave={(data) => {
            if (editor.mode === "edit" && editor.prayer) {
              update(editor.prayer.id, data);
              toast.success("Prayer updated");
            } else {
              add({ ...data, source: "written" });
              toast.success("Prayer saved");
            }
            setEditor(null);
          }}
          onDelete={
            editor.mode === "edit" && editor.prayer
              ? () => {
                  remove(editor.prayer!.id);
                  toast("Prayer deleted");
                  setEditor(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

function PrayerEditor({
  mode,
  prayer,
  onClose,
  onSave,
  onRequest,
  onDelete,
}: {
  mode: "write" | "request" | "edit";
  prayer?: Prayer;
  onClose: () => void;
  onSave: (d: { title: string; body: string }) => void;
  onRequest: (intention: string) => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(prayer?.title ?? "");
  const [body, setBody] = useState(prayer?.body ?? "");
  const [intention, setIntention] = useState("");

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {mode === "edit" ? "Edit prayer" : mode === "request" ? "Request a prayer" : "Write a prayer"}
          </DialogTitle>
          {mode === "request" && (
            <DialogDescription>What's on your heart? Selah will shape it into a prayer.</DialogDescription>
          )}
        </DialogHeader>

        {mode === "request" ? (
          <div className="space-y-3">
            <Textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="e.g. peace for my family, healing for a friend, gratitude…"
              rows={3}
              className="resize-none scrollbar-custom"
            />
            <button
              type="button"
              onClick={() => onRequest(intention)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground transition hover:brightness-105"
            >
              <Sparkles className="h-4 w-4" /> Request Prayer
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={9}
              placeholder="Your prayer…"
              className="resize-none scrollbar-custom"
            />
          </div>
        )}

        {mode !== "request" && (
          <DialogFooter className="gap-2 sm:justify-between">
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-destructive transition hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => {
                if (!title.trim() && !body.trim()) return toast.error("Add a title or body first");
                onSave({ title: title.trim() || "Untitled prayer", body: body.trim() });
              }}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-105"
            >
              Save prayer
            </button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
