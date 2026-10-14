export interface DailyDef { id: string; text: string; event: string; target: number; coins: number; icon: string }

// `event` matches names sent with dispatch({ type: 'EVENT' }).
export const DAILY: DailyDef[] = [
  { id: 'bridge', text: 'Build a bridge that holds 5 cars', event: 'mission:engineer-bridge', target: 1, coins: 30, icon: '🌉' },
  { id: 'lunchbox', text: 'Solve a courtroom mystery', event: 'mission:lawyer-trophy', target: 1, coins: 30, icon: '🔎' },
  { id: 'patients', text: 'Use 3 doctor tools on patients', event: 'medical', target: 3, coins: 25, icon: '🩺' },
  { id: 'chef', text: 'Cook 2 snacks on the stove', event: 'cook', target: 2, coins: 20, icon: '🍳' },
  { id: 'snack', text: 'Feed your characters 4 snacks', event: 'eat', target: 4, coins: 20, icon: '🍎' },
  { id: 'sleepy', text: 'Tuck 2 characters into bed', event: 'sleep', target: 2, coins: 20, icon: '😴' },
  { id: 'artist', text: 'Draw a picture on the chalkboard', event: 'draw', target: 1, coins: 20, icon: '🖍️' },
  { id: 'vet', text: 'Help 3 animals at the Animal Hospital', event: 'pet-care', target: 3, coins: 25, icon: '🐾' },
  { id: 'robot', text: 'Program the robot to reach the charger', event: 'mission:software-robot', target: 1, coins: 30, icon: '🤖' },
  { id: 'friends', text: 'Give 3 hugs to friends', event: 'hug', target: 3, coins: 20, icon: '🤗' },
  { id: 'tower', text: 'Stack a tower 4 blocks tall', event: 'tower4', target: 1, coins: 25, icon: '🧱' },
];

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const dailyFor = (date: string) => {
  const n = date.split('-').reduce((a, p) => a * 31 + Number(p), 7);
  return DAILY[n % DAILY.length];
};
