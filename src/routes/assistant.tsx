import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, Send, BookOpen, Bookmark, Sparkles, Clapperboard, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { VERSES, randomVerse, type Verse } from "@/data/verses";
import { randomBackground } from "@/data/backgrounds";
import { downloadWallpaper } from "@/lib/wallpaper";
import { useSavedWallpapers } from "@/lib/saved-store";
import { usePrayers } from "@/lib/prayers-store";
import { chatAssistant, type AssistantResult } from "@/lib/assistant.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Assistant — Selah" },
      { name: "description", content: "Your gentle guide through Selah — find verses, generate prayers and discover content." },
    ],
  }),
  component: AssistantPage,
});

type Card =
  | { kind: "verse"; verse: Verse; bg: string }
  | { kind: "prayer"; title: string; body: string }
  | { kind: "nav"; to: "/media" | "/bible" | "/donate" | "/reflect"; label: string };

type Msg = { id: string; role: "user" | "assistant"; text?: string; cards?: Card[]; typing?: boolean };

const SUGGESTIONS = ["Encourage me", "Write me a prayer", "Something to listen to", "Find me a verse"];

function findVerse(query: string): Verse {
  const q = query.trim().toLowerCase();
  if (!q) return randomVerse();
  const match = VERSES.find(
    (v) => v.text.toLowerCase().includes(q) || `${v.book} ${v.chapter}`.toLowerCase().includes(q),
  );
  return match ?? randomVerse();
}

function resultToCards(result: AssistantResult): Card[] {
  switch (result.intent) {
    case "prayer":
      return [
        {
          kind: "prayer",
          title: result.prayerTitle?.trim() || "A prayer for you",
          body: result.prayerBody?.trim() || "Heavenly Father, draw near to me today. Amen.",
        },
      ];
    case "verse": {
      const v1 = findVerse(result.topic ?? "");
      const v2 = randomVerse(v1.id);
      return [
        { kind: "verse", verse: v1, bg: randomBackground() },
        { kind: "verse", verse: v2, bg: randomBackground() },
      ];
    }
    case "media":
      return [{ kind: "nav", to: "/media", label: "Open Media" }];
    case "bible":
      return [{ kind: "nav", to: "/bible", label: "Open Bible" }];
    case "donate":
      return [{ kind: "nav", to: "/donate", label: "Open Donate" }];
    case "reflect":
      return [{ kind: "nav", to: "/reflect", label: "Open Reflect" }];
    default:
      return [];
  }
}

function AssistantPage() {
  const callAssistant = useServerFn(chatAssistant);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Peace be with you. I'm your Selah guide — I can help you find a verse, write a prayer, discover media, or get around the app. What's on your heart?",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || busy) return;

    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", text };
    const history = [...messages, userMsg]
      .filter((m) => m.text && !m.typing)
      .map((m) => ({ role: m.role, text: m.text as string }));

    setMessages((m) => [...m, userMsg, { id: "typing", role: "assistant", typing: true }]);
    setInput("");
    setBusy(true);

    try {
      const result = await callAssistant({ data: { messages: history } });
      setMessages((m) =>
        m
          .filter((x) => x.id !== "typing")
          .concat({
            id: `a-${Date.now()}`,
            role: "assistant",
            text: result.reply,
            cards: resultToCards(result),
          }),
      );
    } catch {
      setMessages((m) =>
        m
          .filter((x) => x.id !== "typing")
          .concat({
            id: `a-${Date.now()}`,
            role: "assistant",
            text: "I'm having trouble reaching the well of words right now. Please try again in a moment.",
          }),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col">
      <header className="border-b border-border bg-card/80 px-5 py-3 pl-20 backdrop-blur-md">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <MessageCircle className="h-5 w-5 text-primary" /> Assistant
        </h1>
      </header>

      <div className="no-scrollbar mx-auto w-full max-w-2xl flex-1 space-y-4 overflow-y-auto px-4 py-6">
        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} />
        ))}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition hover:border-primary/40"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="mx-auto flex w-full max-w-2xl items-center gap-2 border-t border-border bg-card px-3 py-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask Selah anything…"
          className="flex-1 rounded-full bg-secondary px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={() => send()}
          disabled={busy}
          aria-label="Send"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:brightness-105 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {msg.text}
        </div>
      </div>
    );
  }
  if (msg.typing) {
    return (
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-card px-4 py-3 text-muted-foreground w-fit">
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.2s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.1s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-start gap-2">
      {msg.text && (
        <div className="max-w-[88%] rounded-2xl rounded-bl-sm bg-card px-4 py-2.5 text-sm leading-relaxed text-foreground">
          {msg.text}
        </div>
      )}
      {msg.cards?.map((c, i) => <AssistantCard key={i} card={c} />)}
    </div>
  );
}

function AssistantCard({ card }: { card: Card }) {
  const navigate = useNavigate();
  const { isSaved, toggle } = useSavedWallpapers();
  const { add } = usePrayers();
  const [savedPrayer, setSavedPrayer] = useState(false);

  if (card.kind === "verse") {
    const v = card.verse;
    const saved = isSaved(v.id, card.bg);
    return (
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border shadow-soft">
        <div className="relative">
          <img src={card.bg} alt="" className="h-28 w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black/35" />
          <p className="absolute inset-0 grid place-items-center px-4 text-center font-verse text-base text-white text-shadow-soft">
            “{v.text}”
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 bg-card px-3 py-2.5">
          <span className="font-verse text-sm italic text-muted-foreground">
            {v.book} {v.chapter}:{v.verse}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => {
                toggle({ verseId: v.id, book: v.book, chapter: v.chapter, verse: v.verse, text: v.text, image: card.bg });
                if (!saved) downloadWallpaper(v, card.bg).catch(() => {});
                toast[saved ? "message" : "success"](saved ? "Removed" : "Saved wallpaper");
              }}
              className={cn(
                "flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition",
                saved ? "border-primary bg-accent/60 text-primary" : "border-border hover:border-primary/40",
              )}
            >
              {saved ? <Check className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />} Save
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/reflect", search: { verseId: v.id, book: v.book, chapter: v.chapter, verse: v.verse, text: v.text, bg: card.bg } })}
              className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs text-primary-foreground transition hover:brightness-105"
            >
              <BookOpen className="h-3.5 w-3.5" /> Read
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (card.kind === "prayer") {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center gap-1.5 text-primary">
          <Sparkles className="h-4 w-4" />
          <h3 className="font-serif text-lg text-foreground">{card.title}</h3>
        </div>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground line-clamp-5">{card.body}</p>
        <button
          type="button"
          disabled={savedPrayer}
          onClick={() => {
            add({ title: card.title, body: card.body, source: "generated" });
            setSavedPrayer(true);
            toast.success("Saved to your Prayers");
          }}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-primary py-2 text-xs font-medium text-primary-foreground transition hover:brightness-105 disabled:opacity-60"
        >
          {savedPrayer ? <Check className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
          {savedPrayer ? "Saved to Prayers" : "Save to Prayers"}
        </button>
      </div>
    );
  }

  // nav card
  const Icon = card.to === "/media" ? Clapperboard : card.to === "/bible" ? BookOpen : card.to === "/donate" ? Sparkles : BookOpen;
  return (
    <button
      type="button"
      onClick={() => navigate({ to: card.to })}
      className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-left shadow-soft transition hover:border-primary/40"
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <span className="font-medium text-foreground">{card.label}</span>
    </button>
  );
}
