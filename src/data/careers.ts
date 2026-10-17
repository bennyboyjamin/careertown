import type { CareerId } from '../engine/types';

export interface CareerDef {
  id: CareerId;
  title: string;          // "Lawyer"
  icon: string;
  color: string;
  building: string;
  blurb: string;          // what this job is, in kid words
  /** What the career-discovery panel says when a kid shines here. */
  strength: string;
  available: boolean;
}

export const CAREERS: Record<CareerId, CareerDef> = {
  lawyer: { id: 'lawyer', title: 'Lawyer', icon: '⚖️', color: '#A98BFF', building: 'courthouse', available: true,
    blurb: 'Lawyers listen carefully, look at evidence and explain what really happened.',
    strength: 'You seem to enjoy solving mysteries and spotting clues.' },
  engineer: { id: 'engineer', title: 'Engineer', icon: '🔧', color: '#FF8A3D', building: 'engineering', available: true,
    blurb: 'Engineers design and test things like bridges, towers and machines.',
    strength: 'You did really well with building challenges.' },
  doctor: { id: 'doctor', title: 'Doctor', icon: '🩺', color: '#FF5D8F', building: 'hospital', available: true,
    blurb: 'Doctors help people stay healthy and feel better.',
    strength: 'You are great at helping characters feel better.' },
  teacher: { id: 'teacher', title: 'Teacher', icon: '🍎', color: '#8BD46E', building: 'school', available: true,
    blurb: 'Teachers help everyone learn new things.',
    strength: 'You love to create and share ideas.' },
  vet: { id: 'vet', title: 'Veterinarian', icon: '🐾', color: '#5FE0B7', building: 'animal-hospital', available: true,
    blurb: 'Vets take care of animals.', strength: 'You are kind and patient with pets.' },
  software: { id: 'software', title: 'Software Engineer', icon: '💻', color: '#3D7BFF', building: 'tech-lab', available: true,
    blurb: 'Software engineers give computers step-by-step instructions.', strength: 'You enjoy logic puzzles.' },
  chef: { id: 'chef', title: 'Chef', icon: '🧑‍🍳', color: '#FF8A3D', building: 'restaurant', available: true,
    blurb: 'Chefs plan meals, cook safely and make food that people love.',
    strength: 'You follow recipes step by step and pay attention to what people order.' },
  entrepreneur: { id: 'entrepreneur', title: 'Business Owner', icon: '🏪', color: '#FFC93C', building: 'shopping', available: false,
    blurb: 'Business owners make and sell things people need.', strength: 'You like making smart choices with coins.' },
};

export const careerLevel = (xp = 0) => 1 + Math.floor(xp / 100);
export const careerProgress = (xp = 0) => (xp % 100) / 100;
