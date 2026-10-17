import type { BuildingId, CareerId, PaperLook } from '../engine/types';

/**
 * Town people: someone to meet at each place that has no mission yet.
 * Tap them, hear about their job, then help with a small "find it" task for coins.
 */
export interface Townie {
  name: string;
  job: string;
  look: PaperLook;
  hello: string;
  /** One kid-sized line about what this job is really like. */
  fact: string;
  ask: string;
  /** What to find (emoji), scattered around the place. Different emoji = different things to spot. */
  find: string[];
  /** Things to find move around (fish swim, butterflies flutter). */
  moving?: boolean;
  thanks: string;
  career?: CareerId;
}

const A = (look: Omit<PaperLook, 'base' | 'acc'>): PaperLook => ({ base: 'adult', acc: {}, ...look });

export const TOWNFOLK: Partial<Record<BuildingId, Townie>> = {
  beach: {
    name: 'Kai', job: 'Lifeguard', look: A({ tone: 3, hair: 'dadshort', hairColor: 'black', top: 'dad-navy-hoodie', bottom: 'dad-blue-jeans', shoes: 'mom-white-sneakers' }),
    hello: 'Hi! I’m Kai, the lifeguard. I keep everyone safe at the beach.',
    fact: 'Lifeguards are strong swimmers, and they practise first aid so they can help anyone who gets hurt.',
    ask: 'The waves washed my 3 lucky seashells away. Can you find them?', find: ['🐚', '🐚', '🐚'],
    thanks: 'You found them all! You’d make a great lifeguard helper.',
  },
  park: {
    name: 'Rosa', job: 'Gardener', look: A({ tone: 1, hair: 'sleekbob', hairColor: 'brown', top: 'mom-pink-cardigan', bottom: 'mom-beige-skirt', shoes: 'mom-pink-flats' }),
    hello: 'Hello! I’m Rosa. I plant the flowers and trees in the park.',
    fact: 'Gardeners learn which plants need sun, shade and water, so the park stays green all year.',
    ask: 'Some flowers are hiding and need water. Can you spot 3 of them?', find: ['🌷', '🌻', '🌼'],
    thanks: 'Thank you! Now every flower has had a drink.',
  },
  cafe: {
    name: 'Mia', job: 'Barista', look: A({ tone: 0, hair: 'momwaves', hairColor: 'blonde', top: 'mom-striped-sweater', bottom: 'mom-black-trousers', shoes: 'mom-white-sneakers' }),
    hello: 'Welcome to the cafe! I’m Mia. I make warm drinks and yummy treats.',
    fact: 'Baristas remember lots of orders at once, and they work as a team to serve people quickly.',
    ask: 'I baked 3 cupcakes for the window, but they rolled away! Can you find them?', find: ['🧁', '🧁', '🧁'],
    thanks: 'Yay, the window looks perfect now. Thanks, helper!', career: 'entrepreneur',
  },
  fishing: {
    name: 'Leo', job: 'Fisher', look: A({ tone: 2, hair: 'dadshort', hairColor: 'brown', top: 'dad-navy-hoodie', bottom: 'mom-black-trousers', shoes: 'dad-brown-loafers' }),
    hello: 'Ahoy! I’m Leo. I go out on my boat to catch fish.',
    fact: 'Fishers check the weather and the tides, and they put back fish that are too small so more can grow.',
    ask: '3 fish are swimming around the dock. Can you catch them? Tap fast!', find: ['🐟', '🐠', '🐟'], moving: true,
    thanks: 'What a catch! I’ll let them swim home now.',
  },
  playground: {
    name: 'Jay', job: 'Coach', look: A({ tone: 3, hair: 'dadshort', hairColor: 'black', top: 'mom-black-zip-jacket', bottom: 'mom-gray-leggings', shoes: 'mom-white-sneakers' }),
    hello: 'Hey there! I’m Coach Jay. I help kids play games and stay active.',
    fact: 'Coaches plan fun practices and cheer everyone on, especially when something feels hard.',
    ask: 'Our 3 balls bounced all over the playground. Can you find them?', find: ['⚽', '🏀', '⚾'],
    thanks: 'Great hustle! Now we can play.', career: 'teacher',
  },
  'nature-trail': {
    name: 'Willow', job: 'Park ranger', look: A({ tone: 1, hair: 'momwaves', hairColor: 'ginger', top: 'mom-trench-coat', bottom: 'mom-blue-jeans', shoes: 'dad-brown-loafers' }),
    hello: 'Hi, hiker! I’m Willow, the park ranger. I look after the forest and its animals.',
    fact: 'Park rangers teach visitors about nature, keep trails safe, and count animals to see how they’re doing.',
    ask: 'Let’s count animals! Can you spot the 3 hiding on the trail?', find: ['🐿️', '🦉', '🦋'], moving: true,
    thanks: 'Wonderful spotting! I’ll write them in my ranger notebook.',
  },
  shopping: {
    name: 'Nia', job: 'Shop owner', look: A({ tone: 3, hair: 'sleekbob', hairColor: 'black', top: 'mom-blue-bow-blouse', bottom: 'mom-black-trousers', shoes: 'mom-pink-flats' }),
    hello: 'Hello! I’m Nia, and this is my clothes shop.',
    fact: 'Shop owners choose what to sell, set prices, and make sure customers find what they need.',
    ask: 'I need 3 things for my window display. Can you find them?', find: ['👗', '👟', '🎀'],
    thanks: 'My window looks amazing! Thank you!', career: 'entrepreneur',
  },
  kpop: {
    name: 'Luna', job: 'Dance trainer', look: A({ tone: 2, hair: 'sleekbob', hairColor: 'pink', top: 'mom-black-zip-jacket', bottom: 'mom-gray-leggings', shoes: 'mom-white-sneakers' }),
    hello: 'Hi, future star! I’m Luna. I teach dance at the K-pop Training Academy.',
    fact: 'Trainers help singers and dancers practise every day. Choreographers make up the dance moves, and producers make the music.',
    ask: 'Our 3 stage things went missing before the show! Can you find them?', find: ['🎤', '🎧', '⭐'],
    thanks: 'Showtime! The full academy with dance and music training is coming soon.',
  },
  bank: {
    name: 'Sam', job: 'Bank teller', look: A({ tone: 0, hair: 'dadshort', hairColor: 'blonde', top: 'judge-suit', bottom: 'gray-trousers', shoes: 'black-shoes' }),
    hello: 'Hi! I’m Sam. I help people keep their money safe at the bank.',
    fact: 'Bank tellers count money carefully and help people save up for things they want.',
    ask: 'I dropped 3 gold coins. Can you help me find them?', find: ['🪙', '🪙', '🪙'],
    thanks: 'All counted! Here are some coins to save for yourself.', career: 'entrepreneur',
  },
};
