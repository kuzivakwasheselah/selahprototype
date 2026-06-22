// Selah curated verses.
//
// Selection strategy (to avoid long, context-dependent passages):
//  1. Self-contained: each verse states a complete thought without needing the
//     surrounding narrative.
//  2. Devotional weight: promises, comfort, identity, wisdom, praise — verses
//     that reward quiet reflection rather than historical detail.
//  3. Length cap: kept readable on a single ambient screen (≈ < 240 chars).
//  4. Canonical spread: drawn across Law, Wisdom, Prophets, Gospels and Epistles
//     so the random feed stays varied.
//
// Starting set: 100 verses (KJV, public domain). Expandable toward 31,102.

export type Verse = {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  testament: "OT" | "NT";
};

const raw: Omit<Verse, "id">[] = [
  { book: "Genesis", chapter: 1, verse: 1, text: "In the beginning God created the heaven and the earth.", testament: "OT" },
  { book: "Genesis", chapter: 1, verse: 27, text: "So God created man in his own image, in the image of God created he him; male and female created he them.", testament: "OT" },
  { book: "Genesis", chapter: 28, verse: 15, text: "And, behold, I am with thee, and will keep thee in all places whither thou goest.", testament: "OT" },
  { book: "Exodus", chapter: 14, verse: 14, text: "The Lord shall fight for you, and ye shall hold your peace.", testament: "OT" },
  { book: "Exodus", chapter: 15, verse: 2, text: "The Lord is my strength and song, and he is become my salvation.", testament: "OT" },
  { book: "Deuteronomy", chapter: 31, verse: 6, text: "Be strong and of a good courage, fear not: for the Lord thy God, he it is that doth go with thee; he will not fail thee, nor forsake thee.", testament: "OT" },
  { book: "Deuteronomy", chapter: 31, verse: 8, text: "And the Lord, he it is that doth go before thee; he will be with thee, he will not fail thee, neither forsake thee: fear not.", testament: "OT" },
  { book: "Joshua", chapter: 1, verse: 9, text: "Be strong and of a good courage; be not afraid, neither be thou dismayed: for the Lord thy God is with thee whithersoever thou goest.", testament: "OT" },
  { book: "1 Samuel", chapter: 16, verse: 7, text: "For the Lord seeth not as man seeth; for man looketh on the outward appearance, but the Lord looketh on the heart.", testament: "OT" },
  { book: "1 Chronicles", chapter: 16, verse: 11, text: "Seek the Lord and his strength, seek his face continually.", testament: "OT" },
  { book: "Nehemiah", chapter: 8, verse: 10, text: "Neither be ye sorry; for the joy of the Lord is your strength.", testament: "OT" },
  { book: "Job", chapter: 19, verse: 25, text: "For I know that my redeemer liveth, and that he shall stand at the latter day upon the earth.", testament: "OT" },
  { book: "Psalms", chapter: 1, verse: 1, text: "Blessed is the man that walketh not in the counsel of the ungodly, nor standeth in the way of sinners.", testament: "OT" },
  { book: "Psalms", chapter: 16, verse: 11, text: "Thou wilt shew me the path of life: in thy presence is fulness of joy; at thy right hand there are pleasures for evermore.", testament: "OT" },
  { book: "Psalms", chapter: 18, verse: 2, text: "The Lord is my rock, and my fortress, and my deliverer; my God, my strength, in whom I will trust.", testament: "OT" },
  { book: "Psalms", chapter: 19, verse: 1, text: "The heavens declare the glory of God; and the firmament sheweth his handywork.", testament: "OT" },
  { book: "Psalms", chapter: 23, verse: 1, text: "The Lord is my shepherd; I shall not want.", testament: "OT" },
  { book: "Psalms", chapter: 23, verse: 4, text: "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me.", testament: "OT" },
  { book: "Psalms", chapter: 23, verse: 6, text: "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord for ever.", testament: "OT" },
  { book: "Psalms", chapter: 27, verse: 1, text: "The Lord is my light and my salvation; whom shall I fear? the Lord is the strength of my life; of whom shall I be afraid?", testament: "OT" },
  { book: "Psalms", chapter: 28, verse: 7, text: "The Lord is my strength and my shield; my heart trusted in him, and I am helped.", testament: "OT" },
  { book: "Psalms", chapter: 30, verse: 5, text: "Weeping may endure for a night, but joy cometh in the morning.", testament: "OT" },
  { book: "Psalms", chapter: 34, verse: 8, text: "O taste and see that the Lord is good: blessed is the man that trusteth in him.", testament: "OT" },
  { book: "Psalms", chapter: 34, verse: 18, text: "The Lord is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.", testament: "OT" },
  { book: "Psalms", chapter: 37, verse: 4, text: "Delight thyself also in the Lord; and he shall give thee the desires of thine heart.", testament: "OT" },
  { book: "Psalms", chapter: 46, verse: 1, text: "God is our refuge and strength, a very present help in trouble.", testament: "OT" },
  { book: "Psalms", chapter: 46, verse: 10, text: "Be still, and know that I am God.", testament: "OT" },
  { book: "Psalms", chapter: 51, verse: 10, text: "Create in me a clean heart, O God; and renew a right spirit within me.", testament: "OT" },
  { book: "Psalms", chapter: 55, verse: 22, text: "Cast thy burden upon the Lord, and he shall sustain thee: he shall never suffer the righteous to be moved.", testament: "OT" },
  { book: "Psalms", chapter: 91, verse: 1, text: "He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty.", testament: "OT" },
  { book: "Psalms", chapter: 103, verse: 2, text: "Bless the Lord, O my soul, and forget not all his benefits.", testament: "OT" },
  { book: "Psalms", chapter: 118, verse: 24, text: "This is the day which the Lord hath made; we will rejoice and be glad in it.", testament: "OT" },
  { book: "Psalms", chapter: 119, verse: 105, text: "Thy word is a lamp unto my feet, and a light unto my path.", testament: "OT" },
  { book: "Psalms", chapter: 121, verse: 1, text: "I will lift up mine eyes unto the hills, from whence cometh my help.", testament: "OT" },
  { book: "Psalms", chapter: 121, verse: 2, text: "My help cometh from the Lord, which made heaven and earth.", testament: "OT" },
  { book: "Psalms", chapter: 139, verse: 14, text: "I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works.", testament: "OT" },
  { book: "Psalms", chapter: 147, verse: 3, text: "He healeth the broken in heart, and bindeth up their wounds.", testament: "OT" },
  { book: "Proverbs", chapter: 3, verse: 5, text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding.", testament: "OT" },
  { book: "Proverbs", chapter: 3, verse: 6, text: "In all thy ways acknowledge him, and he shall direct thy paths.", testament: "OT" },
  { book: "Proverbs", chapter: 4, verse: 23, text: "Keep thy heart with all diligence; for out of it are the issues of life.", testament: "OT" },
  { book: "Proverbs", chapter: 16, verse: 3, text: "Commit thy works unto the Lord, and thy thoughts shall be established.", testament: "OT" },
  { book: "Proverbs", chapter: 18, verse: 10, text: "The name of the Lord is a strong tower: the righteous runneth into it, and is safe.", testament: "OT" },
  { book: "Ecclesiastes", chapter: 3, verse: 1, text: "To every thing there is a season, and a time to every purpose under the heaven.", testament: "OT" },
  { book: "Isaiah", chapter: 26, verse: 3, text: "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.", testament: "OT" },
  { book: "Isaiah", chapter: 40, verse: 31, text: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles.", testament: "OT" },
  { book: "Isaiah", chapter: 41, verse: 10, text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee.", testament: "OT" },
  { book: "Isaiah", chapter: 43, verse: 2, text: "When thou passest through the waters, I will be with thee; and through the rivers, they shall not overflow thee.", testament: "OT" },
  { book: "Isaiah", chapter: 53, verse: 5, text: "He was wounded for our transgressions, he was bruised for our iniquities: and with his stripes we are healed.", testament: "OT" },
  { book: "Jeremiah", chapter: 29, verse: 11, text: "For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end.", testament: "OT" },
  { book: "Jeremiah", chapter: 33, verse: 3, text: "Call unto me, and I will answer thee, and shew thee great and mighty things, which thou knowest not.", testament: "OT" },
  { book: "Lamentations", chapter: 3, verse: 22, text: "It is of the Lord's mercies that we are not consumed, because his compassions fail not.", testament: "OT" },
  { book: "Lamentations", chapter: 3, verse: 23, text: "They are new every morning: great is thy faithfulness.", testament: "OT" },
  { book: "Micah", chapter: 6, verse: 8, text: "What doth the Lord require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?", testament: "OT" },
  { book: "Nahum", chapter: 1, verse: 7, text: "The Lord is good, a strong hold in the day of trouble; and he knoweth them that trust in him.", testament: "OT" },
  { book: "Zephaniah", chapter: 3, verse: 17, text: "The Lord thy God in the midst of thee is mighty; he will save, he will rejoice over thee with joy.", testament: "OT" },
  { book: "Matthew", chapter: 5, verse: 16, text: "Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.", testament: "NT" },
  { book: "Matthew", chapter: 6, verse: 33, text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.", testament: "NT" },
  { book: "Matthew", chapter: 6, verse: 34, text: "Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself.", testament: "NT" },
  { book: "Matthew", chapter: 11, verse: 28, text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.", testament: "NT" },
  { book: "Matthew", chapter: 11, verse: 29, text: "Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls.", testament: "NT" },
  { book: "Matthew", chapter: 19, verse: 26, text: "With men this is impossible; but with God all things are possible.", testament: "NT" },
  { book: "Mark", chapter: 11, verse: 24, text: "What things soever ye desire, when ye pray, believe that ye receive them, and ye shall have them.", testament: "NT" },
  { book: "Mark", chapter: 12, verse: 30, text: "Thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy mind, and with all thy strength.", testament: "NT" },
  { book: "Luke", chapter: 1, verse: 37, text: "For with God nothing shall be impossible.", testament: "NT" },
  { book: "Luke", chapter: 6, verse: 38, text: "Give, and it shall be given unto you; good measure, pressed down, and shaken together, and running over.", testament: "NT" },
  { book: "John", chapter: 1, verse: 5, text: "And the light shineth in darkness; and the darkness comprehended it not.", testament: "NT" },
  { book: "John", chapter: 3, verse: 16, text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", testament: "NT" },
  { book: "John", chapter: 8, verse: 12, text: "I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life.", testament: "NT" },
  { book: "John", chapter: 14, verse: 6, text: "I am the way, the truth, and the life: no man cometh unto the Father, but by me.", testament: "NT" },
  { book: "John", chapter: 14, verse: 27, text: "Peace I leave with you, my peace I give unto you: let not your heart be troubled, neither let it be afraid.", testament: "NT" },
  { book: "John", chapter: 16, verse: 33, text: "In the world ye shall have tribulation: but be of good cheer; I have overcome the world.", testament: "NT" },
  { book: "Romans", chapter: 5, verse: 8, text: "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.", testament: "NT" },
  { book: "Romans", chapter: 8, verse: 28, text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.", testament: "NT" },
  { book: "Romans", chapter: 8, verse: 38, text: "For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, shall be able to separate us from the love of God.", testament: "NT" },
  { book: "Romans", chapter: 12, verse: 2, text: "And be not conformed to this world: but be ye transformed by the renewing of your mind.", testament: "NT" },
  { book: "Romans", chapter: 15, verse: 13, text: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.", testament: "NT" },
  { book: "1 Corinthians", chapter: 10, verse: 13, text: "God is faithful, who will not suffer you to be tempted above that ye are able; but will with the temptation also make a way to escape.", testament: "NT" },
  { book: "1 Corinthians", chapter: 13, verse: 4, text: "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up.", testament: "NT" },
  { book: "1 Corinthians", chapter: 13, verse: 13, text: "And now abideth faith, hope, charity, these three; but the greatest of these is charity.", testament: "NT" },
  { book: "1 Corinthians", chapter: 16, verse: 14, text: "Let all your things be done with charity.", testament: "NT" },
  { book: "2 Corinthians", chapter: 4, verse: 18, text: "While we look not at the things which are seen, but at the things which are not seen: for the things which are seen are temporal.", testament: "NT" },
  { book: "2 Corinthians", chapter: 5, verse: 7, text: "For we walk by faith, not by sight.", testament: "NT" },
  { book: "2 Corinthians", chapter: 5, verse: 17, text: "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.", testament: "NT" },
  { book: "2 Corinthians", chapter: 12, verse: 9, text: "My grace is sufficient for thee: for my strength is made perfect in weakness.", testament: "NT" },
  { book: "Galatians", chapter: 2, verse: 20, text: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me.", testament: "NT" },
  { book: "Galatians", chapter: 5, verse: 22, text: "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith.", testament: "NT" },
  { book: "Galatians", chapter: 6, verse: 9, text: "And let us not be weary in well doing: for in due season we shall reap, if we faint not.", testament: "NT" },
  { book: "Ephesians", chapter: 2, verse: 8, text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.", testament: "NT" },
  { book: "Ephesians", chapter: 3, verse: 20, text: "Now unto him that is able to do exceeding abundantly above all that we ask or think, according to the power that worketh in us.", testament: "NT" },
  { book: "Philippians", chapter: 4, verse: 6, text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.", testament: "NT" },
  { book: "Philippians", chapter: 4, verse: 7, text: "And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.", testament: "NT" },
  { book: "Philippians", chapter: 4, verse: 13, text: "I can do all things through Christ which strengtheneth me.", testament: "NT" },
  { book: "Colossians", chapter: 3, verse: 23, text: "And whatsoever ye do, do it heartily, as to the Lord, and not unto men.", testament: "NT" },
  { book: "1 Thessalonians", chapter: 5, verse: 16, text: "Rejoice evermore. Pray without ceasing. In every thing give thanks.", testament: "NT" },
  { book: "2 Timothy", chapter: 1, verse: 7, text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.", testament: "NT" },
  { book: "Hebrews", chapter: 11, verse: 1, text: "Now faith is the substance of things hoped for, the evidence of things not seen.", testament: "NT" },
  { book: "Hebrews", chapter: 13, verse: 8, text: "Jesus Christ the same yesterday, and to day, and for ever.", testament: "NT" },
  { book: "James", chapter: 1, verse: 5, text: "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.", testament: "NT" },
  { book: "1 Peter", chapter: 5, verse: 7, text: "Casting all your care upon him; for he careth for you.", testament: "NT" },
  { book: "1 John", chapter: 4, verse: 19, text: "We love him, because he first loved us.", testament: "NT" },
  { book: "Revelation", chapter: 21, verse: 4, text: "And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying.", testament: "NT" },
];

export const VERSES: Verse[] = raw.map((v) => ({
  ...v,
  id: `${v.book.replace(/\s+/g, "-").toLowerCase()}-${v.chapter}-${v.verse}`,
}));

export const TOTAL_VERSES_TARGET = 31102;

export function getVerseById(id: string): Verse | undefined {
  return VERSES.find((v) => v.id === id);
}

export function randomVerse(exclude?: string): Verse {
  if (VERSES.length === 1) return VERSES[0];
  let v = VERSES[Math.floor(Math.random() * VERSES.length)];
  while (exclude && v.id === exclude) {
    v = VERSES[Math.floor(Math.random() * VERSES.length)];
  }
  return v;
}
