import exp from "constants";

export const brique_numbers =1;
export const ball_none_numbers = 5;
export const ball_numbers = 0;
export const pig_numbers = 1;
// export const AIR_FRICTION = 0.996; // Friction de l'air ajustable vu qu'on a pas la forme de l'objet
export const COORD_TARGET = { x: 210, y: 500};

export const LOGO_ANGRYBIRD = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Angry_Birds_logos.svg/2560px-Angry_Birds_logos.svg.png';
export const HOMEPAGE_BACKGROUND = 'https://www.angrybirds.com/wp-content/uploads/2024/03/AB2_KeyArt.jpg';
export const PLAY_BUTTON = 'https://img.genial.ly/5ac916d1c1c1330fe7524802/05716208-4713-4ee2-a2d0-33e794446a07.png';
export const MENU_BACKGROUND = 'https://www.angrybirds.com/wp-content/uploads/2024/03/AB2_202208_5000x3000_KeyArt_Flying-e1709633452581.png';
export const END_GAME_BACKGROUND = 'https://www.angrybirds.com/wp-content/uploads/2022/06/CLASSIC22_202201_2560x1440_RovioCom_TopBanner_BG.jpg';
// export const DEFAULT_BACKGROUND_IMAGE = 'data:image/jpeg;base64,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';
// export const DEFAULT_BACKGROUND_IMAGE = './lance.png';
export const IMAGE_SLINGSHOT = 'https://www.clipartmax.com/png/full/110-1101727_sling-shot-image-angry-birds-slingshot-clipart.png';
export const WOOD = "https://static.wikia.nocookie.net/angrybirds/images/d/d4/Toons_Wood_Block.png/revision/latest/thumbnail/width/360/height/450?cb=20210603112536"
export const BLOCK = "https://static.vecteezy.com/system/resources/previews/005/073/986/original/brown-wood-grain-seamless-background-free-vector.jpg";
export const DEFAULT_BACKGROUND_IMAGE = 'https://i.pinimg.com/originals/2c/24/ba/2c24ba2e0e1a2455cccc366a96efcbf0.jpg'
export const DEFAULT_BALL_BACKGROUND='https://www.allbranded.fr/out/shop-fr/pictures/generated/product/1/480_480_80/mo9007-33.jpg';
export const IMAGE_MELODY = 'https://www.angrybirds.com/wp-content/uploads/2022/08/AB2_202211_500x500_Website_Melody.png';
export const IMAGE_BOMB = 'https://www.angrybirds.com/wp-content/uploads/2022/08/AB2_202211_500x500_Website_Bomb.png';
export const IMAGE_RED = 'https://www.angrybirds.com/wp-content/uploads/2022/08/AB2_202211_500x500_Website_Red.png';
export const IMAGE_CHUCK = 'https://www.angrybirds.com/wp-content/uploads/2022/08/AB2_202211_500x500_Website_Chuck.png';
export const IMAGE_MATILDA = 'https://www.angrybirds.com/wp-content/uploads/2022/08/AB2_202211_500x500_Website_Matilda.png';
export const IMAGE_KINGPIG = 'https://www.angrybirds.com/wp-content/uploads/2022/05/ABCOM_202203_1000x1000_CharacterDimensio_KingPig_Classic.png';
export const IMAGE_MINIONPIG ="https://www.angrybirds.com/wp-content/uploads/2022/05/ABCOM_202203_1000x1000_CharacterDimensio_MinionPig_Classic.png";
export const IMAGE_BALL_ALL = [IMAGE_MELODY, IMAGE_BOMB, IMAGE_RED, IMAGE_CHUCK, IMAGE_MATILDA];
export const RADIUS = 30;
export const MINMOVE = 0.7;
export const MAX_DISTANCE = 160; // maximum shoot Vitesse initial 
export const MAX_PATH = 40; // maximum trajectory prevision

export const BALLLIFE = 1114;
export const BRIQUELIFE = 10000;
export const PIGLIFE = 5;
export const PLAYERLIFE = 10;

export const AIR_FRICTION_DESCENDING = 0.999; // Friction de l'air ajustable vu qu'on a pas la forme de l'objet
export const AIR_FRICTION_ASCENDING = 0.995; // Friction de l'air ajustable vu qu'on a pas la forme de l'objet
export const AIR_FRICTION_HORIZONTAL = 0.998; // Friction de l'air ajustable vu qu'on a pas la forme de l'objet
export const SQUARE_RESTITUTION= 0.99; // Friction sur les squares ajustable vu qu'on a pas la velocity de l'objet

export const GRAVITY = 0.1; // Ajustable vu qu'on a pas la notion de poid
export const DAMPING = 0.75; // Coefficient du perte d'energy lors d'une collision avec bord ou sol

export const VELOCITY_THRESHOLD = 0.4; // Coefficient du

// Coefficient de frottement cinétique pour le frottement au sol
export const MU_K = 0.01; // Ajustable vu qu'on a pas definie c'est quell type de matiere le sol

// Coefficient de restitution pour les collisions
export const COEFFICIENT_OF_RESTITUTION = 0.5; // Ajustable vu qu'on a pas la notion de poid

// Mise à jour de GROUND_FRICTION pour utiliser MU_K
export const GROUND_FRICTION = 1 - MU_K; // Calcule la friction au sol à partir de MU_K

export const IMPULSE = 15; // Coefficient de l'impulsion lors d'un tir  ajustable vu qu'on ne calcule pas la force du tir
export const FRICTION_BRICK = 0.99; // Coefficient de frottement pour les briques 
export const MINROTATION = 0.1; // Minimum rotation
export const MASS_BALL = 20; // Masse de la balle
export const MASS_BRIQUE = 40; // Masse de la brique