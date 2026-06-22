import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Send,
  HandHeart,
  X,
  Sparkles,
  Plus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGroups, type GroupPrayer } from "@/lib/groups-store";
import { useProfile, initials } from "@/lib/profile-store";
import { generatePrayer } from "@/lib/prayer-gen";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/prayers/groups/$groupId")({
  head: () => ({ meta: [{ title: "Prayer Group — Selah" }] }),
  component: GroupChatPage,
});

function GroupChatPage() {
  const { groupId } = Route.useParams();
  const navigate = useNavigate();
  const { getGroup, sendMessage, addPrayer } = useGroups();
  const { profile } = useProfile();
  const group = getGroup(groupId);

  const [text, setText] = useState("");
  const [showPrayers, setShowPrayers] = useState(false);
  const [openPrayer, setOpenPrayer] = useState<GroupPrayer | null>(null);
  const [composer, setComposer] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [group?.messages.length]);

  if (!group) {
    return (
      <div className="grid min-h-[100dvh] place-items-center px-6 text-center">
        <div>
          <p className="font-serif text-2xl text-foreground">Group not found</p>
          <button
            type="button"
            onClick={() => navigate({ to: "/prayers" })}
            className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground"
          >
            Back to Prayers
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = group.role === "admin";

  const send = () => {
    if (!text.trim()) return;
    sendMessage(group.id, { author: profile.name, color: profile.color, text: text.trim(), self: true });
    setText("");
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border bg-card/80 px-4 py-3 pl-20 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate({ to: "/prayers" })}
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
          <Users className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-serif text-lg text-foreground">{group.name}</h1>
          <p className="truncate text-xs text-muted-foreground">
            {group.members.map((m) => m.name).join(", ")}
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-5">
        {group.messages.map((m) => (
          <div key={m.id} className={cn("flex items-end gap-2", m.self ? "flex-row" : "flex-row-reverse")}>
            {!m.self && (
              <div
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: m.color }}
              >
                {initials(m.author)}
              </div>
            )}
            <div
              className={cn(
                "max-w-[78%] rounded-2xl px-3.5 py-2",
                m.self
                  ? "rounded-bl-sm bg-primary text-primary-foreground"
                  : "rounded-br-sm border border-border bg-popover text-foreground shadow-soft",
              )}
            >
              {!m.self && (
                <p className="mb-0.5 text-xs font-semibold" style={{ color: m.color }}>
                  {m.author}
                </p>
              )}
              <p className="text-sm leading-relaxed">{m.text}</p>
              <p className={cn("mt-1 text-[10px]", m.self ? "text-primary-foreground/70" : "text-muted-foreground")}>
                {new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        <div ref={endRef} />
      </div>

      {/* Prayers button */}
      <button
        type="button"
        onClick={() => setShowPrayers(true)}
        className="mx-4 mb-2 flex items-center justify-center gap-2 rounded-full bg-accent/70 py-2.5 text-sm font-medium text-accent-foreground transition hover:bg-accent"
      >
        <HandHeart className="h-4 w-4" /> Group Prayers ({group.prayers.length})
      </button>

      {/* Composer */}
      <div className="flex items-center gap-2 border-t border-border bg-card px-3 py-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message"
          className="flex-1 rounded-full bg-secondary px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={send}
          aria-label="Send"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:brightness-105"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>

      {/* Sliding prayers panel */}
      {showPrayers && (
        <>
          <div className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-[2px]" onClick={() => setShowPrayers(false)} />
          <div className="animate-slide-up fixed inset-x-0 bottom-0 z-50 flex max-h-[78dvh] flex-col rounded-t-3xl bg-background shadow-float">
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <div className="mx-auto h-1.5 w-12 rounded-full bg-border" />
            </div>
            <div className="flex items-center justify-between px-5 pb-3">
              <h2 className="font-serif text-xl text-foreground">Group Prayers</h2>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setComposer(true)}
                    className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" /> New
                  </button>
                )}
                <button type="button" onClick={() => setShowPrayers(false)} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-5 pb-8">
              {group.prayers.length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No group prayers yet.{isAdmin ? " Tap New to add one." : ""}
                </p>
              )}
              {group.prayers.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setOpenPrayer(p)}
                  className="block w-full rounded-2xl border border-border bg-card p-4 text-left transition hover:border-primary/40"
                >
                  <h3 className="font-serif text-lg text-foreground">{p.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.by} · {new Date(p.at).toLocaleDateString()}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground line-clamp-2">{p.body}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Full-page prayer view */}
      {openPrayer && (
        <div className="animate-fade-in fixed inset-0 z-[60] flex flex-col bg-background">
          <header className="flex items-center gap-3 border-b border-border px-4 py-3">
            <button type="button" onClick={() => setOpenPrayer(null)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
              <X className="h-5 w-5" />
            </button>
            <span className="text-sm text-muted-foreground">Group Prayer</span>
          </header>
          <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-10">
            <h1 className="font-serif text-3xl text-foreground">{openPrayer.title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {openPrayer.by} · {new Date(openPrayer.at).toLocaleDateString()}
            </p>
            <p className="mt-6 whitespace-pre-line font-verse text-2xl leading-relaxed text-foreground">
              {openPrayer.body}
            </p>
          </div>
        </div>
      )}

      {/* Admin prayer composer */}
      {composer && (
        <GroupPrayerComposer
          author={profile.name}
          onClose={() => setComposer(false)}
          onSave={(p) => {
            addPrayer(group.id, { ...p, by: profile.name });
            toast.success("Prayer added to group");
            setComposer(false);
          }}
        />
      )}
    </div>
  );
}

function GroupPrayerComposer({
  author,
  onClose,
  onSave,
}: {
  author: string;
  onClose: () => void;
  onSave: (p: { title: string; body: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [intention, setIntention] = useState("");

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">New group prayer</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-xl bg-secondary p-2">
          <Input
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder="Generate from an intention…"
            className="border-0 bg-transparent"
          />
          <button
            type="button"
            onClick={() => {
              const out = generatePrayer(intention);
              setTitle(out.title);
              setBody(out.body);
            }}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
          >
            <Sparkles className="h-3.5 w-3.5" /> Generate
          </button>
        </div>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} placeholder="Write the prayer…" />
        <DialogFooter>
          <button
            type="button"
            onClick={() => {
              if (!title.trim() && !body.trim()) return toast.error("Add a title or body");
              onSave({ title: title.trim() || "Group prayer", body: body.trim() });
            }}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-105"
          >
            Add prayer
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
