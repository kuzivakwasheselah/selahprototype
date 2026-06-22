import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CAUSES, type Cause } from "@/data/causes";
import { useDonations } from "@/lib/donations-store";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — Selah" },
      { name: "description", content: "Support a free Selah and give to Christian charities and causes around the world." },
    ],
  }),
  component: DonatePage,
});

const SELAH_TARGET = {
  name: "Selah",
  description:
    "Donations to Selah keep the app completely free for everyone. Your gift funds ongoing development and supports the charities and non-profit organisations partnered with Selah around the world.",
} as const;

const PRESETS = [5, 10, 25, 50];

function DonatePage() {
  const { total, add } = useDonations();
  const [target, setTarget] = useState<{ name: string; description: string } | null>(null);

  return (
    <div className="mx-auto min-h-[100dvh] max-w-4xl px-5 pb-20 pt-20">
      <h1 className="flex items-center gap-2 text-3xl font-semibold text-foreground">
        <Heart className="h-6 w-6 text-primary" />
        Donate
      </h1>
      {total > 0 && (
        <p className="mt-1 text-sm text-muted-foreground">
          Thank you — you've given <span className="font-medium text-foreground">${total}</span> through Selah.
        </p>
      )}

      {/* Donate to Selah */}
      <button
        type="button"
        onClick={() => setTarget(SELAH_TARGET)}
        className="mt-6 flex w-full flex-col items-start gap-3 overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.66_0.1_60)] p-7 text-left text-primary-foreground shadow-float transition hover:brightness-105"
      >
        <Sparkles className="h-7 w-7" />
        <div>
          <h2 className="font-serif text-2xl">Donate to Selah</h2>
          <p className="mt-1 max-w-md text-sm text-primary-foreground/85">
            Help keep Selah free, ad-free and growing for the whole Body of Christ.
          </p>
        </div>
        <span className="mt-1 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium">Give now</span>
      </button>

      {/* Causes */}
      <h2 className="mt-10 font-serif text-2xl text-foreground">Causes on Selah</h2>
      <p className="text-sm text-muted-foreground">Charities, NPOs and Christ-driven causes around the world.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CAUSES.map((c) => (
          <CauseCard key={c.id} cause={c} onView={() => setTarget(c)} />
        ))}
      </div>

      <DonateDialog
        target={target}
        onClose={() => setTarget(null)}
        onDonate={(name, amount) => {
          add(name, amount);
          toast.success(`Thank you for giving $${amount} to ${name}!`, { description: "May God bless your generosity." });
          setTarget(null);
        }}
      />
    </div>
  );
}

function CauseCard({ cause, onView }: { cause: Cause; onView: () => void }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <img src={cause.image} alt={cause.name} className="aspect-[16/10] w-full object-cover" loading="lazy" />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-lg text-foreground">{cause.name}</h3>
        <p className="mt-1 flex-1 text-sm text-muted-foreground line-clamp-3">{cause.description}</p>
        <button
          type="button"
          onClick={onView}
          className="mt-4 rounded-full border border-primary/40 px-4 py-2 text-sm font-medium text-primary transition hover:bg-accent/50"
        >
          View More
        </button>
      </div>
    </div>
  );
}

function DonateDialog({
  target,
  onClose,
  onDonate,
}: {
  target: { name: string; description: string } | null;
  onClose: () => void;
  onDonate: (name: string, amount: number) => void;
}) {
  const [amount, setAmount] = useState<string>("");

  const submit = () => {
    const value = Number(amount);
    if (!value || value <= 0) return toast.error("Enter a valid amount");
    onDonate(target!.name, value);
    setAmount("");
  };

  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {target?.name === "Selah" ? "Donate to Selah" : target?.name}
          </DialogTitle>
          <DialogDescription className="text-left">{target?.description}</DialogDescription>
        </DialogHeader>

        <div className="mt-1 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(String(p))}
              className={
                "rounded-full border px-4 py-1.5 text-sm transition " +
                (amount === String(p)
                  ? "border-primary bg-accent/60 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40")
              }
            >
              ${p}
            </button>
          ))}
        </div>

        <div className="mt-2 flex items-center gap-2 rounded-xl border border-border px-4 py-3">
          <span className="text-lg text-muted-foreground">$</span>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full bg-transparent text-lg outline-none placeholder:text-muted-foreground"
          />
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={submit}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-medium text-primary-foreground transition hover:brightness-105"
          >
            <Heart className="h-4 w-4" /> Donate
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
