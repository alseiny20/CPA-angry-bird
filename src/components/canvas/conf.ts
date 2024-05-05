export const reserve_birds_numbers = 5;

export const COORD_TARGET = { x: 210, y: 500};

export const LOGO_ANGRYBIRD = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Angry_Birds_logos.svg/2560px-Angry_Birds_logos.svg.png';
export const HOMEPAGE_BACKGROUND = 'https://www.angrybirds.com/wp-content/uploads/2024/03/AB2_KeyArt.jpg';
export const PLAY_BUTTON = 'https://img.genial.ly/5ac916d1c1c1330fe7524802/05716208-4713-4ee2-a2d0-33e794446a07.png';
export const MENU_BACKGROUND = 'https://www.angrybirds.com/wp-content/uploads/2024/03/AB2_202208_5000x3000_KeyArt_Flying-e1709633452581.png';
export const END_GAME_BACKGROUND = 'https://www.angrybirds.com/wp-content/uploads/2022/06/CLASSIC22_202201_2560x1440_RovioCom_TopBanner_BG.jpg';
export const IMAGE_SLINGSHOT = '../lance.png';
export const BLOCK = "https://static.vecteezy.com/system/resources/previews/005/073/986/original/brown-wood-grain-seamless-background-free-vector.jpg"
export const DEFAULT_BACKGROUND_IMAGE = 'https://i.pinimg.com/originals/2c/24/ba/2c24ba2e0e1a2455cccc366a96efcbf0.jpg'
export const DEFAULT_BALL_BACKGROUND='https://www.allbranded.fr/out/shop-fr/pictures/generated/product/1/480_480_80/mo9007-33.jpg';
export const IMAGE_MELODY = 'https://www.angrybirds.com/wp-content/uploads/2022/08/AB2_202211_500x500_Website_Melody.png';
export const IMAGE_BOMB = 'https://www.angrybirds.com/wp-content/uploads/2022/08/AB2_202211_500x500_Website_Bomb.png';
export const IMAGE_RED = 'https://www.angrybirds.com/wp-content/uploads/2022/08/AB2_202211_500x500_Website_Red.png';
export const IMAGE_CHUCK = 'https://www.angrybirds.com/wp-content/uploads/2022/08/AB2_202211_500x500_Website_Chuck.png';
export const IMAGE_MATILDA = 'https://www.angrybirds.com/wp-content/uploads/2022/08/AB2_202211_500x500_Website_Matilda.png';
export const IMAGE_KINGPIG = 'https://www.angrybirds.com/wp-content/uploads/2022/05/ABCOM_202203_1000x1000_CharacterDimensio_KingPig_Classic.png';
export const IMAGE_MINIONPIG ="https://www.angrybirds.com/wp-content/uploads/2022/05/ABCOM_202203_1000x1000_CharacterDimensio_MinionPig_Classic.png";
export const IMAGE_PIGS = "https://www.angrybirds.com/wp-content/uploads/2022/05/ABCOM_202203_1000x1000_CharacterDimensio_MinionPig_Classic.png";


export const IMAGE_BIRD_ALL = [IMAGE_MELODY, IMAGE_BOMB, IMAGE_RED, IMAGE_CHUCK, IMAGE_MATILDA];
export const RADIUS = 30;
export const MINMOVE = 0.7;
export const MAX_DISTANCE = 160; // maximum shoot Vitesse initial 
export const MAX_PATH = 40; // maximum trajectory prevision

export const BIRDLIFE = 1114;


export const AIR_FRICTION_DESCENDING = 0.999; // Friction de l'air ajustable 
export const AIR_FRICTION_ASCENDING = 0.995; // Friction de l'air ajustable 
export const AIR_FRICTION_HORIZONTAL = 0.998; // Friction de l'air ajustable 
export const SQUARE_RESTITUTION= 0.99; // Friction sur les squares ajustable
export const ROTATIONFRICTION = 0.001; // Friction de rotation ajustable 
export const GRAVITY = 0.1; // Gravité ajustable
export const VELOCITY_THRESHOLD = 0.4; // Coefficient du seuil de vitesse ajustable

// Coefficient de frottement cinétique pour le frottement au sol
export const MU_K = 0.01; // Ajustable vu qu'on a pas definie c'est quell type de matiere le sol

// Coefficient de restitution pour les collisions
export const COEFFICIENT_OF_RESTITUTION = 0.5; // Ajustable vu qu'on a pas la notion de poid

// Mise à jour de GROUND_FRICTION pour utiliser MU_K
export const GROUND_FRICTION = 1 - MU_K; // Calcule la friction au sol à partir de MU_K
