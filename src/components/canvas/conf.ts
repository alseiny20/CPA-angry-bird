export const AIR_FRICTION = 1; // Friction de l'air ajustable vu qu'on a pas la forme de l'objet

export const RADIUS = 20;
export const MINMOVE = 0.1;

export const BALLLIFE = 4;
export const PLAYERLIFE = 10;

export const GRAVITY = 0.96; // Ajustable vu qu'on a pas la notion de poid
export const DAMPING = 0.96; // Coefficient du perte d'energy lors d'une collision avec bord ou sol

export const VELOCITY_THRESHOLD = 0.5;

// Coefficient de frottement cinétique pour le frottement au sol
export const MU_K = 0.01; // Ajustable vu qu'on a pas definie c'est quell type de matiere le sol

// Coefficient de restitution pour les collisions
export const COEFFICIENT_OF_RESTITUTION = 0.9; // Ajustable vu qu'on a pas la notion de poid

// Mise à jour de GROUND_FRICTION pour utiliser MU_K
export const GROUND_FRICTION = 1 - MU_K; // Calcule la friction au sol à partir de MU_K
