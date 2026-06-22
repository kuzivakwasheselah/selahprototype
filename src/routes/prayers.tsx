import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  HandHeart,
  Pencil,
  Sparkles,
  Plus,
  LogIn,
  Users,
  Crown,
  ChevronRight,
  Trash2,
  Copy,
  Clock,
  UserPlus,
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
import { useGroups, extractInviteCode } from "@/lib/groups-store";
import { useProfile } from "@/lib/profile-store";
import { useAuth } from "@/hooks/use-auth";
import { generatePrayer } from "@/lib/prayer-gen";

export const Route = createFileRoute("/prayers")({
  head: () => ({
    meta: [
      { title: "Prayers — Selah" },
      { name: "description", content: "Write or request personal prayers, and pray together in small prayer groups." },
    ],
  }),
  component: PrayersPage,
});

function PrayersPage() {
  const [tab, setTab] = useState<"personal" | "group">("personal");
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

      <div className="mt-5 grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
        {(["personal", "group"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full py-2.5 text-sm font-medium capitalize transition",
              tab === t ? "bg-card text-foreground shadow-soft" : "text-muted-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">{tab === "personal" ? <PersonalTab /> : <GroupTab />}</div>
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
                {p.source === "generated" ? "Answered" : "Written"}
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

/* ---------------------------------- Group --------------------------------- */

function GroupTab() {
  const { created, joined, createGroup, joinGroup, leaveGroup } = useGroups();
  const { profile } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState<"create" | "join" | null>(null);
  const [authWall, setAuthWall] = useState(false);
  const [value, setValue] = useState("");

  const requireAuth = () => {
    if (!user) {
      setAuthWall(true);
      return false;
    }
    return true;
  };

  const submit = () => {
    if (!value.trim()) return toast.error(dialog === "create" ? "Name your group" : "Paste an invite code or link");
    const self = { name: profile.name, color: profile.color };

    if (dialog === "create") {
      const res = createGroup(value.trim(), self);
      if (res.error) return toast.error(res.error);
      setValue("");
      setDialog(null);
      toast.success("Group created", { description: `Invite code: ${res.group!.code}` });
      navigate({ to: "/prayers/groups/$groupId", params: { groupId: res.group!.id } });
    } else {
      const res = joinGroup(extractInviteCode(value), self);
      if (res.error) return toast.error(res.error);
      setValue("");
      setDialog(null);
      toast.success("Joined group");
      navigate({ to: "/prayers/groups/$groupId", params: { groupId: res.group!.id } });
    }
  };

  return (
    <div className="space-y-4">
      {!created && !joined && (
        <p className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
          Prayer groups are small and intentional — up to 10 people, text only. Create a group to get a
          shareable invite link, or join one with a code.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={!!created}
          onClick={() => {
            if (!requireAuth()) return;
            setDialog("create");
          }}
          className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card py-6 text-sm font-medium transition enabled:hover:border-primary/40 disabled:opacity-50"
        >
          <Plus className="h-5 w-5 text-primary" /> Create Group
        </button>
        <button
          type="button"
          disabled={!!joined}
          onClick={() => {
            if (!requireAuth()) return;
            setDialog("join");
          }}
          className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card py-6 text-sm font-medium transition enabled:hover:border-primary/40 disabled:opacity-50"
        >
          <LogIn className="h-5 w-5 text-primary" /> Join Group
        </button>
      </div>

      {[created, joined].filter(Boolean).map((g) => (
        <GroupCard key={g!.id} group={g!} onLeave={() => { leaveGroup(g!.id); toast("Left group"); }} />
      ))}

      <Dialog open={!!dialog} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {dialog === "create" ? "Create a prayer group" : "Join a prayer group"}
            </DialogTitle>
            <DialogDescription>
              {dialog === "create"
                ? "Give your group a name. You'll get an invite link to share."
                : "Paste the invite code or the full invite link shared with you."}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={dialog === "create" ? "Group name" : "Invite code or link"}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <DialogFooter>
            <button
              type="button"
              onClick={submit}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-105"
            >
              {dialog === "create" ? "Create" : "Join"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auth wall for logged-out users trying to use groups */}
      <Dialog open={authWall} onOpenChange={(o) => !o && setAuthWall(false)}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
              <UserPlus className="h-7 w-7" />
            </div>
            <DialogTitle className="text-center font-serif text-2xl">Create an account to pray together</DialogTitle>
            <DialogDescription className="text-center">
              Prayer groups are shared between members, so we'd love for you to create a free account first.
              It only takes a moment, and you'll be right back here to join.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Link
              to="/auth"
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:brightness-105"
            >
              <LogIn className="h-4 w-4" /> Create an account
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GroupCard({ group, onLeave }: { group: ReturnType<typeof useGroups>["created"]; onLeave: () => void }) {
  if (!group) return null;
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/prayers/groups/$groupId"
          params={{ groupId: group.id }}
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-serif text-lg text-foreground">{group.name}</h3>
              {group.role === "admin" && <Crown className="h-3.5 w-3.5 text-primary" />}
            </div>
            <p className="text-sm text-muted-foreground">
              {group.members.length} {group.members.length === 1 ? "member" : "members"} ·{" "}
              {group.role === "admin" ? "You're the admin" : "Joined"}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </Link>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(`${typeof window !== "undefined" ? window.location.origin : ""}/prayers?invite=${group.code}`);
            toast.success("Invite link copied", { description: `Code: ${group.code}` });
          }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <Copy className="h-4 w-4" /> Invite ({group.code})
        </button>
        <button
          type="button"
          onClick={onLeave}
          className="text-sm text-muted-foreground transition hover:text-destructive"
        >
          Leave
        </button>
      </div>
    </div>
  );
}
