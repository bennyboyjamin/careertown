/** Dress-up characters: canvas size and the lists the character maker offers. The drawings live in dollArt.ts. */
import { ART_GARMENTS, ART_HAIR, ART_DEFAULT_PIC, type GarmentKind } from './dollArt';
export type { GarmentKind };

/** Drawing canvas is 384 x 720; DOLL_PAD extra px above it leave room for tall hair and hats. */
export const DOLL_W = 384;
export const DOLL_PAD = 60;
export const DOLL_H = 720 + DOLL_PAD;
/** Eye centres in drawing px (used to fit glasses and hats). */
export const DOLL_EYES: [[number, number], [number, number]] = [[138, 236], [246, 236]];
/** Top of the skull in drawing px. */
export const DOLL_CROWN = 70;
/** Waist line in drawing px (where the legs fold when sitting). */
export const DOLL_WAIST = 484;

export const DOLL_HAIR: Record<string, { label: string }> = Object.fromEntries(Object.entries(ART_HAIR).map(([k, h]) => [k, { label: h.label }]));
export const DOLL_GARMENTS: Record<string, { kind: GarmentKind; label: string }> = Object.fromEntries(Object.entries(ART_GARMENTS).map(([k, g]) => [k, { kind: g.kind, label: g.label }]));
/** A ready-made picture of the default character, for places that need an image URL. */
export const DOLL_PIC = ART_DEFAULT_PIC;
