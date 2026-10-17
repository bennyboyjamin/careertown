/**
 * Talking with town people and workers. Everything is answered here on the device:
 * no internet, nothing typed is sent or saved.
 */
export interface ChatNpc { name: string; job: string; fact: string; kid?: boolean }

// Mean words and phrases (kept simple; matched as whole words, ignoring case and repeated letters)
const MEAN = [
  'stupid', 'dumb', 'idiot', 'ugly', 'loser', 'smelly', 'stinky', 'fat', 'weirdo', 'jerk', 'gross', 'boring', 'annoying', 'lame',
  'dummy', 'moron', 'poopyhead', 'poopy head', 'poop head', 'butthead', 'butt head', 'baby', 'crybaby', 'nerd', 'freak', 'meanie', 'bad',
  'hate you', 'i hate', 'shut up', 'you suck', 'go away', 'nobody likes you', 'get lost', 'you smell', 'worst',
  'damn', 'crap', 'hell', 'shit', 'fuck', 'bitch', 'ass', 'bastard', 'piss',
];
const norm = (s: string) => ` ${s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/(.)\1{2,}/g, '$1$1').replace(/\s+/g, ' ').trim()} `;
const has = (t: string, words: string[]) => words.some((w) => t.includes(` ${w} `) || t.includes(` ${w}s `));
export const isMean = (text: string) => has(norm(text), MEAN) && !has(norm(text), ['not bad', 'not stupid', 'not dumb', 'not ugly', 'not boring']);

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const JOKES = [
  'Why did the cookie go to the doctor? It felt crummy! 🍪',
  'What do you call a sleeping dinosaur? A dino-snore! 🦖',
  'Why are fish so smart? They live in schools! 🐟',
  'What has ears but can’t hear? A cornfield! 🌽',
  'Why did the teddy bear skip dessert? It was already stuffed! 🧸',
  'What do you call a bear with no teeth? A gummy bear! 🐻',
];

/** What the person says back. */
export function npcReply(text: string, n: ChatNpc): string {
  const t = norm(text);
  if (!t.trim()) return 'Hmm? Did you say something? 🙂';
  if (isMean(text)) return 'I know you are, but what am I? 😜';
  if (has(t, ['bye', 'goodbye', 'see you', 'see ya', 'later', 'good night'])) return 'Bye! Come back soon! 👋';
  if (has(t, ['thank you', 'thanks', 'thank u', 'ty'])) return 'You’re welcome! 😊';
  if (has(t, ['how are you', 'how r u', 'how are u', 'hows it going', 'whats up', 'sup'])) return pick(['I’m great, thanks for asking! How are you?', 'Super! It’s a busy day. How about you?']);
  if (has(t, ['joke', 'funny', 'make me laugh'])) return pick(JOKES);
  if (has(t, ['your name', 'who are you', 'whats your name'])) return n.kid ? `I’m ${n.name}! Nice to meet you!` : `My name is ${n.name}! I’m the ${n.job.toLowerCase()} here.`;
  if (has(t, ['what do you do', 'your job', 'what is your job', 'whats your job', 'work', 'job', 'want to be', 'grow up', 'dream'])) return n.fact;
  if (has(t, ['how old', 'your age'])) return n.kid ? 'I’m a kid, just like you! 😄' : `I’m a grown-up! Old enough to be a ${n.job.toLowerCase()}. 😄`;
  if (has(t, ['favorite', 'favourite', 'fav'])) return pick(['My favorite thing is helping people in CareerTown!', 'My favorite color is rainbow! Is that allowed? 🌈', 'My favorite food is pizza from Café Sunny! 🍕']);
  if (has(t, ['i love you', 'love you', 'like you', 'you are nice', 'youre nice', 'you are cool', 'youre cool', 'awesome', 'best', 'cute', 'pretty', 'nice', 'cool', 'kind'])) return 'Aww, thank you! You’re awesome too! 💖';
  if (has(t, ['im sad', 'i am sad', 'sad', 'upset', 'lonely', 'scared'])) return 'Oh no. 💛 I’m here. Talking to a grown-up you trust can help too. Want to hear a joke?';
  if (has(t, ['im good', 'i am good', 'good', 'great', 'fine', 'happy', 'ok', 'okay'])) return 'Yay! I’m happy you’re happy! 🎉';
  if (has(t, ['help', 'what can i do', 'bored'])) return 'Try tapping things around here, or ask me “what do you do?”';
  if (has(t, ['hi', 'hello', 'hey', 'yo', 'hiya', 'howdy', 'good morning'])) return pick([`Hi there! I’m ${n.name}. 👋`, `Hello, friend! Nice to see you!`]);
  if (has(t, ['yes', 'yeah', 'yep', 'sure'])) return pick(['Okay! 😄', 'Awesome!']);
  if (has(t, ['no', 'nope', 'nah'])) return 'That’s okay!';
  if (t.trim().endsWith('?') || has(t, ['why', 'what', 'how', 'where', 'when', 'who'])) return pick(['Ooh, good question! Hmm… I’m not sure! What do you think?', n.kid ? 'I don’t know! Ask me what I want to be when I grow up!' : `I don’t know that one. Ask me about being a ${n.job.toLowerCase()}!`]);
  return pick(['Ooh, tell me more!', 'Ha ha! You’re funny. 😄', 'Hmm, that’s interesting!', n.kid ? 'Wanna play together? 🎈' : `Want to know what a ${n.job.toLowerCase()} does? Ask me!`]);
}

export const QUICK_SAYS = ['Hi! 👋', 'What do you do?', 'Tell me a joke!', 'How are you?', 'You’re awesome!', 'Bye!'];
