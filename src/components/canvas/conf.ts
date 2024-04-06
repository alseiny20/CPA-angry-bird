import exp from "constants";

export const brique_numbers = 0;
export const ball_none_numbers = 1;
export const ball_numbers = 0;

export const AIR_FRICTION = 0.996; // Friction de l'air ajustable vu qu'on a pas la forme de l'objet

export const RADIUS = 10;
export const MINMOVE = 0.1;

export const BALLLIFE = 1114;
export const BRIQUELIFE = 1111111118;
export const PLAYERLIFE = 10;

export const AIR_FRICTION_DESCENDING = 0.999; // Friction de l'air ajustable vu qu'on a pas la forme de l'objet
export const AIR_FRICTION_ASCENDING = 0.995; // Friction de l'air ajustable vu qu'on a pas la forme de l'objet
export const AIR_FRICTION_HORIZONTAL = 0.998; // Friction de l'air ajustable vu qu'on a pas la forme de l'objet
export const SQUARE_RESTITUTION= 1; // Friction sur les squares ajustable vu qu'on a pas la velocity de l'objet

export const GRAVITY = 0.3; // Ajustable vu qu'on a pas la notion de poid
export const DAMPING = 0.75; // Coefficient du perte d'energy lors d'une collision avec bord ou sol

export const VELOCITY_THRESHOLD = 0.5; // Coefficient du

// Coefficient de frottement cinétique pour le frottement au sol
export const MU_K = 0.01; // Ajustable vu qu'on a pas definie c'est quell type de matiere le sol

// Coefficient de restitution pour les collisions
export const COEFFICIENT_OF_RESTITUTION = 0.75; // Ajustable vu qu'on a pas la notion de poid

// Mise à jour de GROUND_FRICTION pour utiliser MU_K
export const GROUND_FRICTION = 1 - MU_K; // Calcule la friction au sol à partir de MU_K
