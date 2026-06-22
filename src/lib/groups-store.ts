import { useLocalStorage } from "@/hooks/use-local-storage";

export type GroupMessage = {
  id: string;
  author: string;
  color: string;
  text: string;
  at: number;
  self?: boolean;
};

export type GroupPrayer = {
  id: string;
  title: string;
  body: string;
  by: string;
  at: number;
};

export type Group = {
  id: string;
  name: string;
  code: string;
  role: "admin" | "member";
  members: { name: string; color: string }[];
  messages: GroupMessage[];
  prayers: GroupPrayer[];
  createdAt: number;
};

const KEY = "selah:groups";
const MAX_MEMBERS = 10;

function code() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function useGroups() {
  const [groups, setGroups] = useLocalStorage<Group[]>(KEY, []);

  const created = groups.find((g) => g.role === "admin");
  const joined = groups.find((g) => g.role === "member");

  const getGroup = (id: string) => groups.find((g) => g.id === id);

  const createGroup = (name: string, self: { name: string; color: string }) => {
    if (created) return { error: "You can only create one group." };
    const group: Group = {
      id: `grp-${Date.now()}`,
      name,
      code: code(),
      role: "admin",
      members: [self],
      messages: [],
      prayers: [],
      createdAt: Date.now(),
    };
    setGroups((prev) => [...prev, group]);
    return { group };
  };

  const joinGroup = (groupCode: string, self: { name: string; color: string }) => {
    if (joined) return { error: "You can only join one group." };
    // Prototype: joining by code creates a local membership of a shared-feeling group.
    const group: Group = {
      id: `grp-join-${Date.now()}`,
      name: `Prayer Group ${groupCode}`,
      code: groupCode.toUpperCase(),
      role: "member",
      members: [
        { name: "Group Leader", color: "#c9a063" },
        self,
        { name: "Mary", color: "#7a9e7e" },
        { name: "John", color: "#6b9bb5" },
      ],
      messages: [
        {
          id: "seed-1",
          author: "Group Leader",
          color: "#c9a063",
          text: "Welcome! So glad you've joined us. Let's keep one another in prayer this week. 🙏",
          at: Date.now() - 1000 * 60 * 60 * 5,
        },
        {
          id: "seed-2",
          author: "Mary",
          color: "#7a9e7e",
          text: "Amen! Praying for everyone's families.",
          at: Date.now() - 1000 * 60 * 60 * 4,
        },
      ],
      prayers: [
        {
          id: "gp-seed",
          title: "For our week ahead",
          body: "Father, we thank You for this community. Guide each of us through the days ahead, grant us peace in our homes and strength in our work. In Jesus' name, Amen.",
          by: "Group Leader",
          at: Date.now() - 1000 * 60 * 60 * 4,
        },
      ],
      createdAt: Date.now(),
    };
    setGroups((prev) => [...prev, group]);
    return { group };
  };

  const leaveGroup = (id: string) => setGroups((prev) => prev.filter((g) => g.id !== id));

  const sendMessage = (id: string, msg: Omit<GroupMessage, "id" | "at">) =>
    setGroups((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, messages: [...g.messages, { ...msg, id: `m-${Date.now()}`, at: Date.now() }] }
          : g,
      ),
    );

  const addPrayer = (id: string, p: Omit<GroupPrayer, "id" | "at">) =>
    setGroups((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, prayers: [{ ...p, id: `gp-${Date.now()}`, at: Date.now() }, ...g.prayers] }
          : g,
      ),
    );

  return {
    groups,
    created,
    joined,
    getGroup,
    createGroup,
    joinGroup,
    leaveGroup,
    sendMessage,
    addPrayer,
    MAX_MEMBERS,
  };
}
