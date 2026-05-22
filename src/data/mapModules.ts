import type { MapModule } from "../types";

export const MAP_MODULES: MapModule[] = [
  {
    id: "lip-pop-garden",
    title: "Lip Pop Garden",
    subtitle: "/p/ · /b/ · /m/",
    targetId: "p",
    words: ["pop", "puppy", "pea", "papa", "cup"],
    unlocked: true,
    emoji: "🌸",
    color: "#EA580C",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-300",
  },
  {
    id: "round-lips-pond",
    title: "Round Lips Pond",
    subtitle: "/uː/ · OO sounds",
    targetId: "oo",
    words: ["moo", "boo", "moon", "pool", "food"],
    unlocked: true,
    emoji: "💧",
    color: "#7C3AED",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-300",
  },
  {
    id: "tooth-breeze-trail",
    title: "Tooth Breeze Trail",
    subtitle: "/f/ · /v/ sounds",
    targetId: "f",
    words: ["fish", "fun", "leaf", "fox", "fly"],
    unlocked: false,
    emoji: "🍃",
    color: "#16A34A",
    bgColor: "bg-green-100",
    borderColor: "border-green-300",
    comingSoon: true,
  },
  {
    id: "snake-sound-meadow",
    title: "Snake Sound Meadow",
    subtitle: "/s/ · /z/ sounds",
    targetId: "s",
    words: ["sun", "sock", "snake", "star", "soup"],
    unlocked: false,
    emoji: "🐍",
    color: "#CA8A04",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-300",
    comingSoon: true,
  },
  {
    id: "cave-sound-path",
    title: "Cave Sound Path",
    subtitle: "/k/ · /g/ sounds",
    targetId: "k",
    words: ["key", "cake", "car", "cup", "kite"],
    unlocked: false,
    emoji: "🦎",
    color: "#DC2626",
    bgColor: "bg-red-100",
    borderColor: "border-red-300",
    comingSoon: true,
  },
];

export function getModuleById(id: string): MapModule | undefined {
  return MAP_MODULES.find((m) => m.id === id);
}

export function getModuleByTargetId(targetId: string): MapModule | undefined {
  return MAP_MODULES.find((m) => m.targetId === targetId);
}
