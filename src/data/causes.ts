export type Cause = {
  id: string;
  name: string;
  description: string;
  image: string;
};

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

export const CAUSES: Cause[] = [
  {
    id: "c1",
    name: "Clean Water Missions",
    description:
      "Bringing safe drinking water and the hope of the Gospel to rural villages across East Africa.",
    image: photo("photo-1488521787991-ed7bbaae773c"),
  },
  {
    id: "c2",
    name: "Orphan Care Homes",
    description:
      "Providing shelter, education and loving Christian homes for orphaned and vulnerable children.",
    image: photo("photo-1503454537195-1dcabb73ffb9"),
  },
  {
    id: "c3",
    name: "Bibles for the Nations",
    description:
      "Printing and distributing Scripture in native languages to communities that have never owned a Bible.",
    image: photo("photo-1504052434569-70ad5836ab65"),
  },
  {
    id: "c4",
    name: "Disaster Relief Network",
    description:
      "Mobilising churches to deliver food, shelter and comfort to families struck by disaster.",
    image: photo("photo-1469571486292-0ba58a3f068b"),
  },
  {
    id: "c5",
    name: "Prison Ministry",
    description:
      "Walking alongside the incarcerated with discipleship, hope and a path to restoration.",
    image: photo("photo-1518709268805-4e9042af9f23"),
  },
  {
    id: "c6",
    name: "Feed the Hungry",
    description:
      "Stocking community food banks and serving warm meals to neighbours in need every week.",
    image: photo("photo-1488459716781-31db52582fe9"),
  },
];
