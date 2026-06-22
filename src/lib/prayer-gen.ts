// Local prayer composer used as a stand-in for the language model until the
// AI backend is wired in. Produces a warm, scripture-shaped prayer from a
// short intention or topic.

const OPENINGS = [
  "Heavenly Father,",
  "Gracious God,",
  "Lord Jesus,",
  "Loving Father,",
  "Almighty God,",
];

const CLOSINGS = [
  "In Jesus' name we pray, Amen.",
  "We ask this in Your holy name, Amen.",
  "Through Christ our Lord, Amen.",
  "For Your glory, Amen.",
];

export function generatePrayer(intention: string): { title: string; body: string } {
  const topic = intention.trim() || "your peace and guidance";
  const open = OPENINGS[Math.floor(Math.random() * OPENINGS.length)];
  const close = CLOSINGS[Math.floor(Math.random() * CLOSINGS.length)];

  const body = [
    `${open}`,
    `I come before You today with ${topic} on my heart. Thank You for Your faithfulness, for the breath in my lungs, and for the steady love that never lets me go.`,
    `Where I am anxious, give me Your peace that passes understanding. Where I am weak, be my strength. Where I cannot see the way, light the path before me and help me to trust You one step at a time.`,
    `Draw near to me, and let me draw near to You. Shape my heart to reflect Your grace toward everyone I meet.`,
    close,
  ].join("\n\n");

  const title =
    topic.length > 38 ? `Prayer for ${topic.slice(0, 35)}…` : `Prayer for ${topic}`;

  return { title: capitalize(title), body };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
