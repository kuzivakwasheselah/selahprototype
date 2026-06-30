// Selah scroll prayers — short, meaningful prayers meant to be read slowly over
// ambient imagery in the same way verses are read in /reflect.
//
// Starting set: 25 basic but heartfelt prayers covering peace, gratitude,
// strength, guidance, healing, forgiveness and trust.

export type ScrollPrayer = {
  id: string;
  title: string;
  text: string;
};

const raw: Omit<ScrollPrayer, "id">[] = [
  { title: "Morning Surrender", text: "Lord, before the day begins, I give it to You. Order my steps, steady my heart, and let everything I do be done in Your love." },
  { title: "Peace Over Worry", text: "Father, where my mind races with worry, give me Your peace that passes understanding. I cast my anxieties on You, for You care for me." },
  { title: "Strength for Today", text: "God, I am weak, but You are strong. Be my strength in this hour, and carry me through what I cannot face alone." },
  { title: "Gratitude", text: "Thank You, Lord, for the breath in my lungs and the grace that holds me. Open my eyes to the gifts I so easily overlook." },
  { title: "Guide My Path", text: "Lord, light the path before me. Where I cannot see the way, help me to trust You one quiet step at a time." },
  { title: "Healing", text: "Father, You bind up the broken-hearted and heal our wounds. Touch every aching place in me and make me whole again." },
  { title: "Forgiveness", text: "Lord, forgive me where I have fallen short. Wash me clean, and help me to forgive others as freely as You have forgiven me." },
  { title: "Trust in the Waiting", text: "God, when answers are slow to come, teach me to wait on You. Your timing is perfect, and Your love never fails." },
  { title: "A Quiet Heart", text: "Father, still the noise within me. Help me to be still and know that You are God, and that You are enough." },
  { title: "For My Loved Ones", text: "Lord, watch over those I love. Guard their going out and their coming in, and surround them with Your peace today." },
  { title: "Courage", text: "God, where fear whispers, let Your voice be louder. Make me strong and courageous, for You are with me wherever I go." },
  { title: "Provision", text: "Father, You know my every need before I ask. Provide for me as You clothe the lilies and feed the birds, and teach me to trust." },
  { title: "Renewed Hope", text: "Lord, restore my hope when my heart grows weary. Remind me that joy comes in the morning and that You are not finished yet." },
  { title: "Humble Heart", text: "God, strip away my pride. Give me a humble and gentle spirit, and let me walk softly and kindly with everyone I meet." },
  { title: "In the Storm", text: "Father, when the waves rise around me, speak Your peace over the storm. You are my refuge and my very present help in trouble." },
  { title: "Patience", text: "Lord, slow my anxious heart. Grow patience in me, and help me to love others with the same kindness You have shown me." },
  { title: "Joy", text: "God, fill me with the joy of Your presence. May Your gladness be my strength, and let praise rise from my heart today." },
  { title: "Surrendering Control", text: "Father, I release my grip on what I cannot control. Into Your hands I commit my plans, my fears, and my future." },
  { title: "For Wisdom", text: "Lord, give me wisdom for the choices before me. Where I lack understanding, fill me with Your clarity and discernment." },
  { title: "Rest", text: "God, I am tired. Draw me to Your side and let me rest. You give sweet sleep to those You love, so quiet my soul tonight." },
  { title: "Compassion", text: "Father, break my heart for what breaks Yours. Make me quick to help, slow to judge, and generous with mercy." },
  { title: "Faith Over Fear", text: "Lord, increase my faith. When I cannot see the way forward, help me to walk by faith and not by sight." },
  { title: "Thankful in All Things", text: "God, teach me to give thanks in every season — in plenty and in want — knowing that You are working all things for good." },
  { title: "Presence", text: "Father, more than anything, I want to know You are near. Make Your presence real to me, and let me dwell in Your love." },
  { title: "Evening Peace", text: "Lord, as this day ends, I lay it down at Your feet. Forgive what I got wrong, keep what was good, and grant me Your peace through the night." },
];

export const SCROLL_PRAYERS: ScrollPrayer[] = raw.map((p) => ({
  ...p,
  id: p.title.replace(/\s+/g, "-").toLowerCase(),
}));

export function randomScrollPrayer(exclude?: string): ScrollPrayer {
  if (SCROLL_PRAYERS.length === 1) return SCROLL_PRAYERS[0];
  let p = SCROLL_PRAYERS[Math.floor(Math.random() * SCROLL_PRAYERS.length)];
  while (exclude && p.id === exclude) {
    p = SCROLL_PRAYERS[Math.floor(Math.random() * SCROLL_PRAYERS.length)];
  }
  return p;
}
