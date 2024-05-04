import { stat } from 'fs';
import * as conf from './conf'
export type Coord = { x: number; y: number; dx: number; dy: number }
export type Point = { x: number; y: number }

export type Ball = {
  coord: Coord;
  life: number;
  weight: number; // Ajout du poids de la balle
  target?: boolean; //;
  resting?: boolean;
  initDrag?: Coord;
  selectect?: boolean;
  invincible?: number;
  color?: string;
  image?: string;
  radius: number;
  alpha?: number;
};
export type Pig = {
  coord: Coord;
  life: number;
  weight: number; // Ajout du poids de la balle
  target?: boolean; //;
  resting?: boolean;
  initDrag?: Coord;
  selectect?: boolean;
  invincible?: number;
  color?: string;
  image?: string;
  radius: number;
  alpha?: number;
};
export type Brique = {
  coord: Coord; 
  width: number;
  height: number;
  weight: number; // Ajout du poids de la brique
  life: number;
  resting?: boolean;
  initDrag?: Coord;
  selectect?: boolean;
  invincible?: number;
  color?: string;
  image?: string;
  rotationAngle: number; // Add rotation angle parameter
  angularVelocity: number; // Add angular velocity parameter
  momentOfInertia: number;
  center : Coord;
  alpha : number;
  dr : number;
  corner : Array<Point>;
};

type Size = { height: number; width: number }

export type State = {
  pos: Array<Ball>
  pigs: Array<Pig>
  briques : Array<Brique>
  reserves: Array<Ball>
  target: Ball | null
  shoot: Array<Coord> | null
  size: Size
  endOfGame: boolean
}
var inTurn = true;

const dist2 = (o1: Coord, o2: Coord) =>
  Math.pow(o1.x - o2.x, 2) + Math.pow(o1.y - o2.y, 2)

const iterate = (bound: Size) => (ball: Ball, briques: Array<Brique>) => {
  let coord = { ...ball.coord };

  // appliation la gravité
  if (!ball.resting) {
      coord.dy += conf.GRAVITY * ball.weight;
  }

  // résistance de l'air de manière différente selon la direction
  if (coord.dy > 0) {
      // Descendre : la résistance de l'air ralentit moins la balle
      coord.dy *= conf.AIR_FRICTION_DESCENDING;
  } else {
      // Monter : la résistance de l'air ralentit plus la balle
      coord.dy *=  conf.AIR_FRICTION_ASCENDING;
  }

  // résistance de l'air horizontalement
  coord.dx *= conf.AIR_FRICTION_HORIZONTAL;

  // Mise à jour des positions
  coord.x += coord.dx;
  coord.y += coord.dy;

  // Gestion des collisions avec les bords horizontaux et amortissement
  if (coord.x - conf.RADIUS < 0 || coord.x + conf.RADIUS > bound.width) {
      coord.dx *= -conf.COEFFICIENT_OF_RESTITUTION;
      coord.x = Math.max(coord.x, conf.RADIUS);
      coord.x = Math.min(coord.x, bound.width - conf.RADIUS);
  }
  
  // Gestion des collisions avec le bord supérieur et amortissement
  if (coord.y - conf.RADIUS < 0) {
      coord.dy *= -conf.COEFFICIENT_OF_RESTITUTION;
      coord.y = Math.max(coord.y, conf.RADIUS);
  }

  // Gestion des collisions avec le sol, amortissement et frottement
  if (coord.y + conf.RADIUS >= bound.height) {
      coord.dy *= -conf.COEFFICIENT_OF_RESTITUTION;
      coord.y = bound.height - conf.RADIUS;

      // Appliquer le frottement au sol si la balle est au repos
      if (Math.abs(coord.dy) < conf.VELOCITY_THRESHOLD) {
          coord.dy = 0;
          ball.resting = true;
          if (Math.abs(coord.dx) > conf.VELOCITY_THRESHOLD) {
              coord.dx *= conf.GROUND_FRICTION;
          } else {
              coord.dx = 0;
          }
      }
  }

  ball.invincible = ball.invincible ? ball.invincible - 1 : 0;

  // Ajuster la position si nécessaire avec checkPossibleMove
  // const adjustedPos = checkPossibleMove(ball, briques, bound);

  return {
      ...ball,
      coord: coord
  };
};
export function getRotatedRectanglePoints(brique: Brique): Point[] {
  const points: Point[] = [];
  const angle = brique.alpha * Math.PI / 180; // Conversion de degrés en radians
  const cx = brique.coord.x + brique.width / 2; // Centre x de la brique
  const cy = brique.coord.y + brique.height / 2; // Centre y de la brique

  // Coins de la brique avant rotation
  const corners = [
      { x: brique.coord.x, y: brique.coord.y },
      { x: brique.coord.x + brique.width, y: brique.coord.y },
      { x: brique.coord.x + brique.width, y: brique.coord.y + brique.height },
      { x: brique.coord.x, y: brique.coord.y + brique.height }
  ];

  // Calculer les coins rotés
  corners.forEach(corner => {
      const rotatedX = Math.cos(angle) * (corner.x - cx) - Math.sin(angle) * (corner.y - cy) + cx;
      const rotatedY = Math.sin(angle) * (corner.x - cx) + Math.cos(angle) * (corner.y - cy) + cy;
      points.push({ x: rotatedX, y: rotatedY });
  });

  return points;
}
const getRotatedCorners = (brick: Brique): Point[] => {
  const angleInRadians = -brick.alpha * (Math.PI / 180); // Convert angle to radians

  // Center of the brick
  const centerX = brick.coord.x + brick.width / 2;
  const centerY = brick.coord.y + brick.height / 2;

  // Corners of the brick
  const corners: Point[] = [
    { x: brick.coord.x, y: brick.coord.y }, // Top-left
    { x: brick.coord.x + brick.width, y: brick.coord.y }, // Top-right
    { x: brick.coord.x + brick.width, y: brick.coord.y + brick.height }, // Bottom-right
    { x: brick.coord.x, y: brick.coord.y + brick.height } // Bottom-left
  ];

  // Rotate each corner around the center
  const rotatedCorners = corners.map(corner => {
    const xRel = corner.x - centerX;
    const yRel = corner.y - centerY;

    return {
      x: centerX + xRel * Math.cos(angleInRadians) - yRel * Math.sin(angleInRadians),
      y: centerY + xRel * Math.sin(angleInRadians) + yRel * Math.cos(angleInRadians)
    };
  });

  return rotatedCorners;
};
// const iterateBrique = (bound: Size) => (brique: Brique, otherBriques: Array<Brique>) => {

//   //brique.corner =  getRotatedCorners(brique);
//   // console.log(brique.corner)
//   if (brique.resting) {
//     // // Check if the brick is flat (parallel to the ground)
//     return brique;
//   }

//   const { coord } = brique;
//   const gravityCenterX = coord.x + brique.width / 2;
//   const gravityCenterY = coord.y + brique.height / 2;
  

  
//   // Calculate collision point with other bricks
//   // const collisionPoint = otherBriques.reduce<Point | null>((collision, other) => {
//   //   if (brique !== other) {
//   //     const point = calculateCollisionPoint(brique, other);
//   //     return point ? point : collision;
//   //   }
//   //   return collision;
//   // }, null);

//   // // Apply gravity and rotation
//   // applyGravityAndRotation(brique, collisionPoint);


//   // Apply gravity
//   coord.dy += conf.GRAVITY * brique.weight;

//   // Apply air resistance
//   const airFriction = coord.dy > 0 ? conf.AIR_FRICTION_DESCENDING : conf.AIR_FRICTION_ASCENDING;
//   coord.dy *= airFriction;
//   coord.dx *= conf.AIR_FRICTION_HORIZONTAL;

//   // Update positions
//   const newGravityCenterX = gravityCenterX + coord.dx;
//   const newGravityCenterY = gravityCenterY + coord.dy;

//   // Update brick position based on gravity center
//   coord.x = newGravityCenterX - brique.width / 2;
//   coord.y = newGravityCenterY - brique.height / 2;

//   // Handle collisions with boundaries
//   if (coord.x < 0 || coord.x + brique.width > bound.width) {
//     coord.dx *= -conf.COEFFICIENT_OF_RESTITUTION;
//     coord.x = Math.max(coord.x, 0);
//     coord.x = Math.min(coord.x, bound.width - brique.width);
//   }

//   if (coord.y < 0 || coord.y + brique.height > bound.height) {
//     coord.dy *= -conf.COEFFICIENT_OF_RESTITUTION;
//     coord.y = Math.max(coord.y, 0);
//     coord.y = Math.min(coord.y, bound.height - brique.height);
//   }
  
  
//   // Resting conditions
//   const restingOnGround = coord.y + brique.height >= bound.height;
//   const restingOnBrick = otherBriques.some((other) => {
//     return (
//       brique !== other &&
//       coord.y + brique.height >= other.coord.y &&
//       coord.y <= other.coord.y + other.height &&
//       coord.x + brique.width > other.coord.x &&
//       coord.x < other.coord.x + other.width
//     );
//   });

  
//   if (restingOnGround || restingOnBrick) {
//     coord.dy = 0;
//     coord.y = restingOnGround
//       ? bound.height - brique.height
//       : Math.min(
//           ...otherBriques
//             .filter(
//               (other) =>
//                 brique !== other &&
//                 coord.y + brique.height >= other.coord.y &&
//                 coord.y <= other.coord.y + other.height &&
//                 coord.x + brique.width > other.coord.x &&
//                 coord.x < other.coord.x + other.width
//             )
//             .map((other) => other.coord.y - brique.height)
//         );

//     // Apply ground friction if resting on ground
//     if (restingOnGround) {
//       coord.dx *= conf.GROUND_FRICTION;
//     }
//   } 

//   // Update alpha based on the decay rate
//   if (brique.dr > 0) {
//     brique.dr -= 0.001;
//   } else if (brique.dr < 0) {
//     brique.dr += 0.001;
//   }
//   // Absolute value of dr
//   if (Math.abs(brique.dr) > 0.001) {
//     brique.alpha += brique.dr;
//   }

//   return {
//     ...brique,
//     coord: coord,
//     corner :  getRotatedCorners(brique)
//   };
// };
const iterateBrique = (bound: Size) => (brique: Brique, otherBriques: Array<Brique>) => {
  if (brique.resting) {
      return brique;
  }
  let coord = { ...brique.coord };
// Calculate gravity center
let gravityCenterX = coord.x + brique.width / 2; // Center of the brick along the x-axis
let gravityCenterY = coord.y + brique.height / 2; // Center of the brick along the y-axis
//   // Calculate torque and rotation angle based on unbalance (for simplicity, assuming a linear relationship)
// const unbalanceTorque = brique.weight * conf.GRAVITY * unbalanceFactor; // Adjust unbalanceFactor based on your logic
// const rotationAngle = unbalanceTorque / brique.weight; // Angle of rotation due to unbalance

// Apply gravity to the gravity center
coord.dy += conf.GRAVITY * brique.weight;

// Apply air resistance based on direction to the gravity center
const airFriction = coord.dy > 0 ? conf.AIR_FRICTION_DESCENDING : conf.AIR_FRICTION_ASCENDING;
coord.dy *= airFriction;
coord.dx *= conf.AIR_FRICTION_HORIZONTAL;

// Update positions of the gravity center
gravityCenterX += coord.dx;
gravityCenterY += coord.dy;

// Update brick position based on gravity center
coord.x = gravityCenterX - brique.width / 2;
coord.y = gravityCenterY - brique.height / 2;

  // coord.dy += conf.GRAVITY * brique.weight;
  // const airFriction = coord.dy > 0 ? conf.AIR_FRICTION_DESCENDING : conf.AIR_FRICTION_ASCENDING;
  // coord.dy *= airFriction;
  // coord.dx *= conf.AIR_FRICTION_HORIZONTAL;

  // coord.x += brique.coord.dx;
  // coord.y += brique.coord.dy;

  // Handle collisions with boundaries
  if (coord.x < 0 || coord.x + brique.width > bound.width) {
      brique.coord.dx *= -conf.COEFFICIENT_OF_RESTITUTION;
      coord.x = Math.max(coord.x, 0);
      coord.x = Math.min(coord.x, bound.width - brique.width);
  }

  if (coord.y < 0 || coord.y + brique.height > bound.height) {
      brique.coord.dy *= -conf.COEFFICIENT_OF_RESTITUTION;
      coord.y = Math.max(coord.y, 0);
      coord.y = Math.min(coord.y, bound.height - brique.height);
  }

  // Resting conditions
  const restingOnGround = coord.y + brique.height >= bound.height;
  const restingOnOtherBrick = otherBriques.some((other) => {
      return (
          brique !== other &&
          coord.y + brique.height >= other.coord.y &&
          coord.y <= other.coord.y + other.height &&
          coord.x + brique.width > other.coord.x &&
          coord.x < other.coord.x + other.width
      );
  });

  if (restingOnGround || restingOnOtherBrick) {
      coord.dy = 0;
      coord.y = restingOnGround
          ? bound.height - brique.height
          : Math.min(
              ...otherBriques
                  .filter(
                      (other) =>
                          brique !== other &&
                          coord.y + brique.height >= other.coord.y &&
                          coord.y <= other.coord.y + other.height &&
                          coord.x + brique.width > other.coord.x &&
                          coord.x < other.coord.x + other.width
                  )
                  .map((other) => other.coord.y - brique.height)
          );
             // Apply ground friction if resting on ground
      if (restingOnGround) {
        coord.dx *= conf.GROUND_FRICTION;
        
      }
  }

  // Update alpha based on the decay rate
  // on applique la friction de l'air
  if (brique.dr > 0) {
    brique.dr -= 0.001
  }else if (brique.dr < 0) {
    brique.dr += 0.001
  }
  console.log("dr", brique.dr);
  // valeur absolue de dr 
  if (Math.abs(brique.dr) > 0.001) {
    brique.alpha += brique.dr
  }

  return {  
      ...brique,
      coord: coord,
  };
};
  const iteratePig = (bound: Size) => (pig: Pig) => {
    let coord = { ...pig.coord };
    // appliation la gravité
        coord.dy += conf.GRAVITY * pig.weight;
    // résistance de l'air de manière différente selon la direction
    if (coord.dy > 0) {
        // Descendre : la résistance de l'air ralentit moins la balle
        coord.dy *= conf.AIR_FRICTION_DESCENDING;
    } else {
        // Monter : la résistance de l'air ralentit plus la balle
        coord.dy *=  conf.AIR_FRICTION_ASCENDING;
    }
    // résistance de l'air horizontalement
    coord.dx *= conf.AIR_FRICTION_HORIZONTAL;

    // Mise à jour des positions
    coord.x += coord.dx;
    coord.y += coord.dy;

    // Gestion des collisions avec les bords horizontaux et amortissement
    if (coord.x - conf.RADIUS < 0 || coord.x + conf.RADIUS > bound.width) {
        coord.dx *= -conf.COEFFICIENT_OF_RESTITUTION;
        coord.x = Math.max(coord.x, conf.RADIUS);
        coord.x = Math.min(coord.x, bound.width - conf.RADIUS);
    }
    
    // Gestion des collisions avec le bord supérieur et amortissement
    if (coord.y - conf.RADIUS < 0) {
        coord.dy *= -conf.COEFFICIENT_OF_RESTITUTION;
        coord.y = Math.max(coord.y, conf.RADIUS);
    }

    // Gestion des collisions avec le sol, amortissement et frottement
    if (coord.y + conf.RADIUS >= bound.height) {
        coord.dy *= -conf.COEFFICIENT_OF_RESTITUTION;
        coord.y = bound.height - conf.RADIUS;

        // Appliquer le frottement au sol si la balle est au repos
        if (Math.abs(coord.dy) < conf.VELOCITY_THRESHOLD) {
            coord.dy = 0;
            pig.resting = true;
            if (Math.abs(coord.dx) > conf.VELOCITY_THRESHOLD) {
                coord.dx *= conf.GROUND_FRICTION;
            } else {
                coord.dx = 0;
            }
        }
    }

    pig.invincible = pig.invincible ? pig.invincible - 1 : 0;
    return {
      ...pig,
      coord: coord,
    };
  };
const collide = (o1: Coord, o2: Coord) =>
  dist2(o1, o2) < Math.pow(2 * conf.RADIUS, 2)

  export const collideBallBall = (ball1: Coord, ball2: Coord) => {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normal and tangential directions
    const nx = dx / distance;
    const ny = dy / distance;
    const gx = -ny;
    const gy = nx;

    // Velocity components in normal and tangential directions
    const v1n = nx * ball1.dx + ny * ball1.dy;
    const v2n = nx * ball2.dx + ny * ball2.dy;
    const v1g = gx * ball1.dx + gy * ball1.dy;
    const v2g = gx * ball2.dx + gy * ball2.dy;

    // Exchange normal velocities for elastic collision
    ball1.dx = nx * v2n + gx * v1g;
    ball1.dy = ny * v2n + gy * v1g;
    ball2.dx = nx * v1n + gx * v2g;
    ball2.dy = ny * v1n + gy * v2g;

    // Adjust positions to resolve overlap
    const overlap = 2 * conf.RADIUS - distance;
    const correctionFactor = overlap / 2;
    ball1.x -= correctionFactor * nx;
    ball1.y -= correctionFactor * ny;
    ball2.x += correctionFactor * nx;
    ball2.y += correctionFactor * ny;
}


export const collideBallBrick = (ball: Ball, brick: Brique) => {
  // Convert brick angle from degrees to radians for transformations
  const angle = -brick.alpha * Math.PI / 180;

  // Calculate the coordinates of the ball relative to the rotated brick
  const rotatedBallX = Math.cos(angle) * (ball.coord.x - (brick.coord.x + brick.width / 2)) -
                       Math.sin(angle) * (ball.coord.y - (brick.coord.y + brick.height / 2)) +
                       (brick.coord.x + brick.width / 2);

  const rotatedBallY = Math.sin(angle) * (ball.coord.x - (brick.coord.x + brick.width / 2)) +
                       Math.cos(angle) * (ball.coord.y - (brick.coord.y + brick.height / 2)) +
                       (brick.coord.y + brick.height / 2);

  // Calculate nearest point on the rotated brick to the rotated ball position
  const nearestX = Math.max(brick.coord.x, Math.min(rotatedBallX, brick.coord.x + brick.width));
  const nearestY = Math.max(brick.coord.y, Math.min(rotatedBallY, brick.coord.y + brick.height));

  const deltaX = rotatedBallX - nearestX;
  const deltaY = rotatedBallY - nearestY;
  const distanceSquared = deltaX * deltaX + deltaY * deltaY;
  const radiusSquared = ball.radius * ball.radius;

  if (distanceSquared <= radiusSquared) {
      const distance = Math.sqrt(distanceSquared);
      const nx = deltaX / distance;
      const ny = deltaY / distance;

      // Calculate relative velocity
      const relativeVelX = ball.coord.dx - brick.coord.dx;
      const relativeVelY = ball.coord.dy - brick.coord.dy;
      const velAlongNormal = relativeVelX * nx + relativeVelY * ny;

      if (velAlongNormal < 0 && !ball.invincible) {
          // Adjust ball position to resolve collision
          const overlap = ball.radius - distance;
          ball.coord.x += overlap * nx;
          ball.coord.y += overlap * ny;

          // Decrease brick strength or destroy it
          brick.life--;

          // Calculate impulse and update ball velocity
          const impulse = -(0.7 + conf.COEFFICIENT_OF_RESTITUTION) * velAlongNormal / (1 / ball.weight + 1 / brick.weight);
          ball.coord.dx += (impulse / ball.weight) * nx;
          ball.coord.dy += (impulse / ball.weight) * ny;

          ball.invincible = 1; // Prevent immediate re-collision

          // Update brick velocity (Push back the brick)
          const brickImpulse = (2 + conf.COEFFICIENT_OF_RESTITUTION) * velAlongNormal / (1 / ball.weight + 1 / brick.weight);
          brick.coord.dx += (brickImpulse / brick.weight) * nx + conf.GRAVITY ;
          brick.coord.dy += (brickImpulse / brick.weight) * ny + conf.GRAVITY ;

          // Calculate rotational impulse based on the impact point, adjusted for lever arm effect
            const centerOfBrickX = brick.coord.x + brick.width / 2;
            const centerOfBrickY = brick.coord.y + brick.height / 2;
            const leverArmX = nearestX - centerOfBrickX;
            const leverArmY = nearestY - centerOfBrickY;
            const torque = leverArmX * ny - leverArmY * nx; // Torque calculation: cross product of lever arm and normal

            // Adjust rotational velocity based on the direction of the torque
            brick.dr -= torque / (brick.weight * Math.sqrt(leverArmX * leverArmX + leverArmY * leverArmY));
            // Apply a small additional rotation to the brick
      // const rotationFactor = 15; // Adjust rotation factor as needed
      // brick.alpha += rotationFactor * (torque > 0 ? 1 : -1); // Rotate based on the torque direction
      }
  } else {
      ball.invincible = 0; // Reset invincibility when not colliding
  }
  
  // if(brick.coord.y + brick.height >= ground && brick.coord.dy>0){
  //   brick.life -=0;
  // }
};

function applyGroundFrictionAndResting(obj: any, groundY: number) {
    if (Math.abs(obj.dy) < conf.VELOCITY_THRESHOLD && (obj.y + obj.height >= groundY || obj.y + obj.radius >= groundY)) {
        obj.dy = 0; // Object is at rest vertically
        obj.dx *= conf.GROUND_FRICTION; // Apply horizontal friction

        if (Math.abs(obj.dx) < conf.VELOCITY_THRESHOLD) {
            obj.dx = 0; // Object comes to rest horizontally
            obj.resting = true;
        }
    }
}

function checkStacking(brique: Brique, otherBriques: Array<Brique>): boolean {
    otherBriques.forEach((other) => {
        if (brique !== other &&
          brique.coord.x < other.coord.x + other.width && brique.coord.x + brique.width > other.coord.x &&
            Math.abs(brique.coord.y + brique.height - other.coord.y) < conf.VELOCITY_THRESHOLD) {
            return true;
        }
    });
    return false;
  }
  
 
function arePolygonsColliding(points: Point[], brique: Brique): boolean {
  // Implémenter SAT pour vérifier la collision un point et un polygone
  const axes = getAxes(points)
  const briquePoints = getRotatedRectanglePoints(brique);
  const briqueAxes = getAxes(briquePoints);
  
  for (let i = 0; i < axes.length; i++) {
      const axis = axes[i];
      const projection1 = projectPolygon(axis, points);
      const projection2 = projectPolygon(axis, briquePoints);

      if (!isOverlapping(projection1, projection2)) {
          return false;
      }
  }

  for (let i = 0; i < briqueAxes.length; i++) {
      const axis = briqueAxes[i];
      const projection1 = projectPolygon(axis, points);
      const projection2 = projectPolygon(axis, briquePoints);

      if (!isOverlapping(projection1, projection2)) {
          return false;
      }
  }

  return true;
}
export const collideRectangleRectangle= (brique1: Brique, brique2: Brique) => {
  const points1 = getRotatedRectanglePoints(brique1);
  console.log("points---1", points1);

  const points2 = getRotatedRectanglePoints(brique2);
  console.log("points---2", points2);

  if (arePolygonsColliding(points1, brique2)) {
      handleCollisionResponse(brique1, brique2);
  }
};

function pointBall(point: Point ): Ball {
  return {
    coord: {
      x: point.x,
      y: point.y,
      dx: 0,
      dy: 0
    },
    life: 1,
    weight: 1.2,
    radius: 10
  };
}

function getAxes(points: Point[]): Point[] {
  const axes = [];
  for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length]; // Pour créer un axe avec le point suivant (cycle au premier point)
      const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
      const normal = { x: -edge.y, y: edge.x }; // Perpendiculaire à l'arête
      const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
      normal.x /= length;
      normal.y /= length;
      axes.push(normal);
  }
  return axes;
}

function projectPolygon(axis: Point, points: Point[]): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;

  points.forEach(point => {
      let projection = point.x * axis.x + point.y * axis.y;
      if (projection < min) min = projection;
      if (projection > max) max = projection;
  });

  return { min, max };
}

function isOverlapping(projection1: { min: number; max: number }, projection2: { min: number; max: number }): boolean {
  return !(projection1.max < projection2.min || projection2.max < projection1.min);
}

function handleCollisionResponse(brique1: Brique, brique2: Brique) {
  // Réponse simplifiée : ajuster les positions et vitesses pour "résoudre" la collision
  // Cela peut être raffiné selon les besoins spécifiques du jeu
  const dxMean = (brique1.coord.dx + brique2.coord.dx) / 2;
  const dyMean = (brique1.coord.dy + brique2.coord.dy) / 2;

  brique1.coord.dx = dxMean;
  brique2.coord.dx = dxMean;
  brique1.coord.dy = dyMean;
  brique2.coord.dy = dyMean;


  brique1.dr *= -0.5;
  brique2.dr *= -0.5;
} 
  
const checkBallBriqueCollision = (circle: Ball, rect: Brique) => {
  let testX = circle.coord.x;
  let testY = circle.coord.y;

  if (circle.coord.x < rect.coord.x) {
    testX = rect.coord.x;
  } else if (circle.coord.x > rect.coord.x + rect.width) {
    testX = rect.coord.x + rect.width;
  }

  if (circle.coord.y < rect.coord.y) {
    testY = rect.coord.y;
  } else if (circle.coord.y > rect.coord.y + rect.height) {
    testY = rect.coord.y + rect.height;
  }

  let distX = circle.coord.x - testX;
  let distY = circle.coord.y - testY;
  let distance = Math.sqrt(distX * distX + distY * distY);

  if (distance <= conf.RADIUS) {
    return true;
  }
  return false;
};

const choose_new_target = (state: State) => {
  const newTarget = state.reserves.pop();
  if (newTarget) {
    return {
      ...state,
      target: {...newTarget, coord: { ...conf.COORD_TARGET, dx: 0, dy: 0 }},
      pos: [...state.pos, {...newTarget, coord: { ...conf.COORD_TARGET, dx: 0, dy: 0 }}],
    };
  }
  return state;
};

export const step = (state: State) => {
  if (!inTurn){
    // console.log("taillle des pigs " + state.pigs.length + " end of game" + state.endOfGame)
    // console.log(state.pigs.length<=0)
    if (state.pos.length <= 0  && state.reserves.length <= 0 && state.target == null || state.pigs.length <= 0){
      console.log("je modifie le end of game")
      return {...state, endOfGame: true};
    }
    state = choose_new_target(state);
  }

  state.pos.map((p1, i, arr) => {
    arr.slice(i + 1).map((p2) => {
      if (collide(p1.coord, p2.coord)) {
        if (!p1.invincible) {
          p1.life--
          p1.invincible = 20
        }
        if (!p2.invincible) {
          p2.life--
          p2.invincible = 20
        }
        collideBallBall(p1.coord, p2.coord)
      }
    })
    
    state.pos.forEach((ball) => {
      state.briques.forEach((brique) => {
        // if (checkBallBriqueCollision(ball, brique)) {
          console.log("collision detected");
          // let a = adjustPosition(ball.coord, brique.coord, brique.coord.x, brique.coord.y);
          // handleBallBriqueCollision(ball, brique);
          // ball.coord = a;
          collideBallBrick(ball, brique);
          //collideBallRectangle(ball, brique,state.size.height,state.briques);
        // }
      });
      state.pigs.forEach((pig) => {
        if (collide(ball.coord, pig.coord)) {
          console.log("collision detected");
          // let a = adjustPosition(ball.coord, brique.coord, brique.coord.x, brique.coord.y);
          // handleBallPigCollision(ball, pig);
          // ball.coord = a;
          if (!ball.invincible) {
            ball.life--
            ball.invincible = 20
          }
          if (!pig.invincible) {
            pig.life--
            pig.invincible = 20
          }
          collideBallBall(ball.coord, pig.coord);
        }
      });
    });
   
  })
  state.pigs.forEach((pig) => {
    state.briques.forEach((brique) => {
      if (checkBallBriqueCollision(pig, brique)) {
        pig.life--;
        collideBallBrick(pig, brique);
      }
    });
  });
  state.briques.forEach((brique, i, arr) => {
    arr.slice(i + 1).forEach((other) => {
      collideRectangleRectangle(other,brique);//, state.size,state.briques);
    });
  });

  inTurn = !check_endTurn(state)

  var balls = state.pos.map(ball => iterate(state.size)(ball, state.briques)).filter((p) => p.life > 0);

  if (!inTurn) {
    balls = balls.filter((ball) => ball.target === false || !ball.target)
  }
  var pigs = state.pigs.map(iteratePig(state.size)).filter(p => p.life > 0)
  // s'il ya un shoot en cour met a jour la trajectoir
  var briques =state.briques.map((brique: Brique) => iterateBrique(state.size)(brique, state.briques)).filter(p => p.life > 0)
  const newState = {
    ...state,
    pos: balls,
    pigs: pigs,
    briques: briques,
  };

  return newState;
};

function findPath(target: Ball): Array<Coord> {
  var path = new Array<Coord>()
  var ball = { ...target }
  for (var i = 0; i < conf.MAX_PATH; i++) {
    path.push({ x: ball.coord.x, y: ball.coord.y, dx: ball.coord.dx, dy: ball.coord.dy })
    ball = iterate({ height: 5000, width: 5000 })(ball, [])
    ball = iterate({ height: 5000, width: 5000 })(ball, [])
  }
  return path
}
const hasMoved = (obj: Ball | Brique) => obj.coord.dx !== 0 || obj.coord.dy !== 0;

const check_endTurn = (state: State) => {
  const ballsMoved = state.pos.some(hasMoved);
  // const briquesMoved = state.briques.some(hasMoved);
  
  return !ballsMoved /* && !briquesMoved */ && state.target === null;
};

export const click =
  (state: State) =>
  (event: PointerEvent): State => {
    const { offsetX, offsetY } = event
    const target = state.pos.find(
      (p) =>
        dist2(p.coord, { x: offsetX, y: offsetY, dx: 0, dy: 0 }) <
        Math.pow(conf.RADIUS, 2) + 100
    )
    if (target) {
      target.coord.dx += Math.random() * 10
      target.coord.dy += Math.random() * 10
    }
    return state
  }

export const mousedown = 
  (state: State) =>
  (event: PointerEvent): State => {
    const { offsetX, offsetY } = event
    const target = state.pos.find(
      (p) =>
        dist2(p.coord, { x: offsetX, y: offsetY, dx: 0, dy: 0 }) <
        Math.pow(conf.RADIUS, 2) + 100
    )
    if (target) {
      target.selectect = true
      target.initDrag = { x: offsetX, y: offsetY, dx: 0, dy: 0 }
      console.log("selectect", target.coord)
    }
    return state
  }

  export const mouseMove = (state: State) => (event: PointerEvent): State => {
    const { offsetX, offsetY } = event;
    const target = state.pos.find((p) => p.selectect === true);

    if (target && target.selectect && target.initDrag) {
        const dx = offsetX - target.initDrag.x;
        const dy = offsetY - target.initDrag.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        console.log('distance', distance);

        if (distance < conf.MAX_DISTANCE) {
            target.coord.x = offsetX;
            target.coord.y = offsetY;
        } else {
            // on recupere la direction du vecteur de distance
            const dirX = dx / distance;
            const dirY = dy / distance;

            // on limite la distance maximale du drag 
            target.coord.x = target.initDrag.x + dirX * conf.MAX_DISTANCE;
            target.coord.y = target.initDrag.y + dirY * conf.MAX_DISTANCE;
        }

        // on trace le chemin shoot
        const path = findPath(
          {...target,
             resting: false,
             coord: {
             x: target.coord.x, y: target.coord.y, dx: 
             (target.initDrag.x - target.coord.x) / 10, dy: (target.initDrag.y - target.coord.y) / 10 }});
        console.log('babal',path);
        return { ...state, pos: state.pos, shoot: path };
    }


    return state;
};


export const mouseup = (state: State) => (event: PointerEvent): State => {
  const { offsetX, offsetY } = event;
  console.log('mouseup', offsetX, offsetY)

  let isBeginOfGame = false;

  const updatedPos = state.pos.map((p) => {
    if (p.selectect) {
      const dx = p.initDrag ? (p.initDrag.x - p.coord.x) / 10 : p.coord.dx;
      const dy = p.initDrag ? (p.initDrag.y - p.coord.y) / 10 : p.coord.dy;
      console.log('drag', dx, dy);
      isBeginOfGame = true;

      return {
        ...p,
        selectect: false,
        coord: { ...p.coord, dx, dy },
        resting: p.target ? false : p.resting,
      };
    }
    return p
  });

  return { ...state, pos: updatedPos, shoot: null, target:  isBeginOfGame ? null : state.target };
};


export const endOfGame = (state: State): boolean => {
  return (state.reserves.length === 0 && (state.pos.filter((p) => p.coord.dx !== 0 && p.coord.dy !== 0).length === 0 && state.target === null)) || state.pigs.length <= 0;
}
