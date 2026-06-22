import { useLocalStorage } from "@/hooks/use-local-storage";

export type Profile = {
  name: string;
  color: string;
};

const KEY = "selah:profile";

const COLORS = ["#c9a063", "#7a9e7e", "#8a7eb5", "#b5757e", "#6b9bb5", "#b59a6b"];

function defaultProfile(): Profile {
  return { name: "Friend", color: COLORS[Math.floor(Math.random() * COLORS.length)] };
}

export function useProfile() {
  const [profile, setProfile] = useLocalStorage<Profile>(KEY, defaultProfile());
  const update = (patch: Partial<Profile>) => setProfile((p) => ({ ...p, ...patch }));
  return { profile, update };
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
