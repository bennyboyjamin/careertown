import type { BuildingId, CareerId, Reward } from '../engine/types';

export interface MissionDef {
  id: string;
  career: CareerId;
  building: BuildingId;
  title: string;
  pitch: string;
  minutes: number;
  reward: Reward;
  repeatReward: Reward;   // smaller reward for replays
}

export const MISSIONS: Record<string, MissionDef> = {
  'lifeguard-duty': {
    id: 'lifeguard-duty', career: 'lifeguard', building: 'beach',
    title: 'Lifeguard on Duty',
    pitch: 'Help Kai keep the beach safe: raise the right flag, spot swimmers who need help and teach beach safety.',
    minutes: 5,
    reward: { coins: 55, xp: 75, career: 'lifeguard', careerXp: 120, badge: 'beach-hero', title: 'Everyone is safe at the beach!' },
    repeatReward: { coins: 15, xp: 20, career: 'lifeguard', careerXp: 40, title: 'Another safe day at the beach!' },
  },
  'bank-saver': {
    id: 'bank-saver', career: 'entrepreneur', building: 'bank',
    title: 'Super Saver',
    pitch: 'Help Sam the bank teller count coins for customers, then save your pocket money for something big.',
    minutes: 5,
    reward: { coins: 55, xp: 75, career: 'entrepreneur', careerXp: 120, badge: 'super-saver', title: 'You’re a super saver!' },
    repeatReward: { coins: 15, xp: 20, career: 'entrepreneur', careerXp: 40, title: 'Saved again!' },
  },
  'shop-owner': {
    id: 'shop-owner', career: 'entrepreneur', building: 'shopping',
    title: 'Run Nia’s Shop',
    pitch: 'Nia needs a helper! Set fair prices, serve customers and give the right change.',
    minutes: 5,
    reward: { coins: 55, xp: 75, career: 'entrepreneur', careerXp: 120, badge: 'shop-star', title: 'The shop had a great day!' },
    repeatReward: { coins: 15, xp: 20, career: 'entrepreneur', careerXp: 40, title: 'Another busy day at the shop!' },
  },
  'kpop-star': {
    id: 'kpop-star', career: 'performer', building: 'kpop',
    title: 'Rising Star Training',
    pitch: 'Train with Luna at the K-pop Academy: learn a dance, make your own song, then put on a show with your friends!',
    minutes: 6,
    reward: { coins: 55, xp: 75, career: 'performer', careerXp: 120, badge: 'rising-star', title: 'What a show! You’re a rising star!' },
    repeatReward: { coins: 15, xp: 20, career: 'performer', careerXp: 40, title: 'Encore! Another great show!' },
  },
  'chef-pizza': {
    id: 'chef-pizza', career: 'chef', building: 'restaurant',
    title: 'Pizza Party at Café Sunny',
    pitch: 'Café Sunny is busy! Help Chef Sunny get ready, follow the recipe and make pizzas just the way each customer ordered.',
    minutes: 6,
    reward: { coins: 55, xp: 75, career: 'chef', careerXp: 120, badge: 'pizza-chef', unlocks: ['wear:top:chef', 'dough'], title: 'Pizza party served!' },
    repeatReward: { coins: 15, xp: 20, career: 'chef', careerXp: 40, title: 'Another happy table!' },
  },
  'vet-checkup': {
    id: 'vet-checkup', career: 'vet', building: 'animal-hospital',
    title: 'Clover’s Clinic Visit',
    pitch: 'Clover the bunny hopped through a muddy garden. Check her heartbeat, clean her paws and help her feel comfy.',
    minutes: 5,
    reward: { coins: 55, xp: 75, career: 'vet', careerXp: 120, badge: 'animal-helper', unlocks: ['pet:bunny', 'pet:bow-pink'], title: 'Clover is happy and healthy!' },
    repeatReward: { coins: 15, xp: 20, career: 'vet', careerXp: 40, title: 'Another happy animal!' },
  },
  'software-robot': {
    id: 'software-robot', career: 'software', building: 'tech-lab',
    title: 'Robot to the Charger',
    pitch: 'Bolt the robot is out of power. Give Bolt step-by-step commands to reach the charger.',
    minutes: 6,
    reward: { coins: 55, xp: 75, career: 'software', careerXp: 120, badge: 'code-cadet', unlocks: ['minibot'], title: 'Bolt is charged up!' },
    repeatReward: { coins: 15, xp: 20, career: 'software', careerXp: 40, title: 'Program complete!' },
  },
  'lawyer-trophy': {
    id: 'lawyer-trophy', career: 'lawyer', building: 'courthouse',
    title: 'The Missing Science Trophy',
    pitch: 'The school trophy vanished and Ben is being blamed. Look at the evidence and find out what really happened.',
    minutes: 8,
    reward: { coins: 60, xp: 80, career: 'lawyer', careerXp: 120, badge: 'mystery-solver', unlocks: ['wear:top:suit', 'pet:kitten'], title: 'Case closed!' },
    repeatReward: { coins: 15, xp: 20, career: 'lawyer', careerXp: 40, title: 'Case closed again!' },
  },
  'engineer-bridge': {
    id: 'engineer-bridge', career: 'engineer', building: 'engineering',
    title: 'The River Bridge',
    pitch: 'Cars can’t cross Blue River. Design a bridge that holds 5 cars without going over budget.',
    minutes: 5,
    reward: { coins: 60, xp: 80, career: 'engineer', careerXp: 120, badge: 'bridge-builder', unlocks: ['wear:top:vest', 'wear:hat:hardhat'], title: 'Bridge open!' },
    repeatReward: { coins: 15, xp: 20, career: 'engineer', careerXp: 40, title: 'Another strong bridge!' },
  },
  'doctor-checkup': {
    id: 'doctor-checkup', career: 'doctor', building: 'hospital',
    title: 'Check-up for Pip',
    pitch: 'Pip fell off a scooter and feels wobbly. Give Pip a friendly check-up.',
    minutes: 4,
    reward: { coins: 50, xp: 70, career: 'doctor', careerXp: 120, badge: 'caring-doctor', unlocks: ['wear:top:labcoat', 'pet:puppy'], title: 'Pip feels better!' },
    repeatReward: { coins: 15, xp: 20, career: 'doctor', careerXp: 40, title: 'Another happy patient!' },
  },
};
