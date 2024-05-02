import { stat } from 'fs';
import * as conf from './conf'
import path from 'path';
export type Coord = { x: number; y: number; dx: number; dy: number }
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


// const iterateBrique = (bound: Size) => (brique: Brique, otherBriques: Array<Brique>) => {
//     if (brique.resting) {
//         return brique;
//     }
//     let coord = { ...brique.coord };
//   // Calculate gravity center
//   let gravityCenterX = coord.x + brique.width / 2; // Center of the brick along the x-axis
//   let gravityCenterY = coord.y + brique.height / 2; // Center of the brick along the y-axis
  
//   // Apply gravity to the gravity center
//   coord.dy += conf.GRAVITY * brique.weight;

//   // Apply air resistance based on direction to the gravity center
//   const airFriction = coord.dy > 0 ? conf.AIR_FRICTION_DESCENDING : conf.AIR_FRICTION_ASCENDING;
//   coord.dy *= airFriction;
//   coord.dx *= conf.AIR_FRICTION_HORIZONTAL;

//   // Update positions of the gravity center
//   gravityCenterX += coord.dx;
//   gravityCenterY += coord.dy;

//   // Update brick position based on gravity center
//   coord.x = gravityCenterX - brique.width / 2;
//   coord.y = gravityCenterY - brique.height / 2;

//     // coord.dy += conf.GRAVITY * brique.weight;
//     // const airFriction = coord.dy > 0 ? conf.AIR_FRICTION_DESCENDING : conf.AIR_FRICTION_ASCENDING;
//     // coord.dy *= airFriction;
//     // coord.dx *= conf.AIR_FRICTION_HORIZONTAL;

//     // coord.x += brique.coord.dx;
//     // coord.y += brique.coord.dy;

//     // Handle collisions with boundaries
//     if (coord.x < 0 || coord.x + brique.width > bound.width) {
//         brique.coord.dx *= -conf.COEFFICIENT_OF_RESTITUTION;
//         coord.x = Math.max(coord.x, 0);
//         coord.x = Math.min(coord.x, bound.width - brique.width);
//     }

//     if (coord.y < 0 || coord.y + brique.height > bound.height) {
//         brique.coord.dy *= -conf.COEFFICIENT_OF_RESTITUTION;
//         coord.y = Math.max(coord.y, 0);
//         coord.y = Math.min(coord.y, bound.height - brique.height);
//     }

//     // Resting conditions
//     const restingOnGround = coord.y + brique.height >= bound.height;
//     const restingOnOtherBrick = otherBriques.some((other) => {
//         return (
//             brique !== other &&
//             coord.y + brique.height >= other.coord.y &&
//             coord.y <= other.coord.y + other.height &&
//             coord.x + brique.width > other.coord.x &&
//             coord.x < other.coord.x + other.width
//         );
//     });

//     if (restingOnGround || restingOnOtherBrick) {
//         coord.dy = 0;
//         coord.y = restingOnGround
//             ? bound.height - brique.height
//             : Math.min(
//                 ...otherBriques
//                     .filter(
//                         (other) =>
//                             brique !== other &&
//                             coord.y + brique.height >= other.coord.y &&
//                             coord.y <= other.coord.y + other.height &&
//                             coord.x + brique.width > other.coord.x &&
//                             coord.x < other.coord.x + other.width
//                     )
//                     .map((other) => other.coord.y - brique.height)
//             );
//                // Apply ground friction if resting on ground
//         if (restingOnGround) {
//           coord.dx *= conf.GROUND_FRICTION;
//         }
//     }
//     return {
//         ...brique,
//         coord: coord,
//     };
// };
const iterateBrique = (bound: Size) => (brique: Brique, otherBriques: Array<Brique>) => {
  if (brique.resting) {
      return brique;
  }

  const { coord } = brique;
  const gravityCenterX = coord.x + brique.width / 2;
  const gravityCenterY = coord.y + brique.height / 2;

  // Apply gravity
  coord.dy += conf.GRAVITY * brique.weight;

  // Apply air resistance
  const airFriction = coord.dy > 0 ? conf.AIR_FRICTION_DESCENDING : conf.AIR_FRICTION_ASCENDING;
  coord.dy *= airFriction;
  coord.dx *= conf.AIR_FRICTION_HORIZONTAL;

  // Update positions
  const newGravityCenterX = gravityCenterX + coord.dx;
  const newGravityCenterY = gravityCenterY + coord.dy;

  // Update brick position based on gravity center
  coord.x = newGravityCenterX - brique.width / 2;
  coord.y = newGravityCenterY - brique.height / 2;

  // Handle collisions with boundaries
  if (coord.x < 0 || coord.x + brique.width > bound.width) {
      coord.dx *= -conf.COEFFICIENT_OF_RESTITUTION;
      coord.x = Math.max(coord.x, 0);
      coord.x = Math.min(coord.x, bound.width - brique.width);
  }

  if (coord.y < 0 || coord.y + brique.height > bound.height) {
      coord.dy *= -conf.COEFFICIENT_OF_RESTITUTION;
      coord.y = Math.max(coord.y, 0);
      coord.y = Math.min(coord.y, bound.height - brique.height);
  }

  // Resting conditions
  const restingOnGround = coord.y + brique.height >= bound.height;
  const restingOnBrick = otherBriques.some((other) => {
      return (
          brique !== other &&
          coord.y + brique.height >= other.coord.y &&
          coord.y <= other.coord.y + other.height &&
          coord.x + brique.width > other.coord.x &&
          coord.x < other.coord.x + other.width
      );
  });

  if (restingOnGround || restingOnBrick) {
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
      // if (restingOnGround) {
          // coord.dx *= conf.GROUND_FRICTION;
      // }
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

const calculateUnbalanceFactor = (collisionPoint: Coord, brick: Brique) => {
  const center = {
    x: brick.coord.x + brick.width / 2,
    y: brick.coord.y + brick.height / 2,
  };
  const maxDistance = Math.sqrt((brick.width / 2) ** 2 + (brick.height / 2) ** 2);
  const distance = Math.sqrt((collisionPoint.x - center.x) ** 2 + (collisionPoint.y - center.y) ** 2);
  return distance / maxDistance;
};

const calculateTorque = (brick: Brique, unbalanceFactor: number) => {
  // Calculate torque based on unbalance factor
  // return brick.weight * conf.GRAVITY * unbalanceFactor;
      // Calculate torque based on unbalance factor and gravity
      const unbalancedTorque = brick.weight * conf.GRAVITY * unbalanceFactor * brick.height / 2; // Consider height for torque
      const balancedTorque = brick.weight * conf.GRAVITY * brick.height / 2; // Torque when balanced
      return unbalancedTorque - balancedTorque;
};

// const calculateRotationAngle = (torque: number, brick: Brique) => {
//   // Calculate rotation angle based on torque and brick properties
//   return torque / brick.weight; // Adjust as needed
// };
const calculateRotationAngle = (torque: number, brick: Brique, collisionPoint: Coord) => {
  // Calculate rotation radius based on distance from center to collision point
  const radius = Math.sqrt((collisionPoint.x - (brick.coord.x + brick.width / 2)) ** 2 +
                           (collisionPoint.y - (brick.coord.y + brick.height / 2)) ** 2);
  // Calculate angular acceleration based on torque and moment of inertia
  const angularAccel = torque / brick.momentOfInertia;
  // Calculate rotation angle based on angular acceleration and rotation radius
  return angularAccel * radius;
};


export const collideBallBrick = (ball: Ball, brick: Brique)=> {
  const nearestX = Math.max(brick.coord.x, Math.min(ball.coord.x, brick.coord.x + brick.width));
  const nearestY = Math.max(brick.coord.y, Math.min(ball.coord.y, brick.coord.y + brick.height));
  const collisionPoint = { x: nearestX, y: nearestY , dx: 0, dy: 0};
  const unbalanceFactor = calculateUnbalanceFactor(collisionPoint, brick);
  const deltaX = ball.coord.x - nearestX;
  const deltaY = ball.coord.y - nearestY;
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
          const impulse = -(1 + conf.COEFFICIENT_OF_RESTITUTION) * velAlongNormal / (1 / ball.weight + 1 / brick.weight);
          ball.coord.dx += (impulse / ball.weight) * nx;
          ball.coord.dy += (impulse / ball.weight) * ny;

          ball.invincible = 1; // Prevent immediate re-collision
          // Handle rotation after collision
          
          const torque = calculateTorque(brick, unbalanceFactor);
          // const rotationAngle = calculateRotationAngle(torque, brick);
          // brick.rotationAngle += rotationAngle;
          const rotationAngle = calculateRotationAngle(torque, brick, collisionPoint);

          // Update brick rotation angle
          brick.rotationAngle += rotationAngle;
          // Update brick velocity (Push back the brick)
          const brickImpulse = conf.IMPULSE * (1 + conf.COEFFICIENT_OF_RESTITUTION) * velAlongNormal / (1 / ball.weight + 1 / brick.weight);

          brick.coord.dx += (brickImpulse / brick.weight) * nx;
          brick.coord.dy += (brickImpulse / brick.weight) * ny;
      }
  } else {
      ball.invincible = 0; // Reset invincibility when not colliding
  }
}


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
/**
 * Handles collision detection and response between two rectangles, including
 * the application of friction, restitution, and checking for resting conditions.
 */
export const collideRectangleRectangle = (brique1: Brique, brique2: Brique, groundY: number, otherBriques: Array<Brique>) => {
  
  // Check for and handle collision
  if (areRectanglesColliding(brique1, brique2)) {
      // Simplified response: Adjust positions and velocities
      let overlapX = calculateOverlap(brique1.coord.x, brique1.width, brique2.coord.x, brique2.width);
      let overlapY = calculateOverlap(brique1.coord.y, brique1.height, brique2.coord.y, brique2.height);

      const collisionPoint = { x: overlapX, y: overlapY , dx: 0, dy: 0};
      const unbalanceFactor1 = calculateUnbalanceFactor(collisionPoint, brique1);
      const unbalanceFactor2 = calculateUnbalanceFactor(collisionPoint, brique2);
      // Resolve the smaller overlap
      if (overlapX < overlapY) {
        brique1.coord.dx = -brique1.coord.dx * conf.COEFFICIENT_OF_RESTITUTION;
        brique2.coord.dx = -brique2.coord.dx * conf.COEFFICIENT_OF_RESTITUTION;
          adjustPositionsX(brique1, brique2, overlapX);
      } else {
        brique1.coord.dy = -brique1.coord.dy * conf.COEFFICIENT_OF_RESTITUTION;
        brique2.coord.dy = -brique2.coord.dy * conf.COEFFICIENT_OF_RESTITUTION;
          adjustPositionsY(brique1, brique2, overlapY);
      }
      // Calculate rotation effects
      const torque1 = calculateTorque(brique1, unbalanceFactor1);
      const rotationAngle1 = calculateRotationAngle(torque1, brique1,collisionPoint);
      brique1.rotationAngle += rotationAngle1;

      const torque2 = calculateTorque(brique2, unbalanceFactor2);
      const rotationAngle2 = calculateRotationAngle(torque2, brique2,collisionPoint);
      brique2.rotationAngle += rotationAngle2;
      // Apply gravity and check rotation angle
      applyGravity(brique1,collisionPoint);
      applyGravity(brique2,collisionPoint);
  }
  // Apply ground friction and check resting conditions
  applyGroundFrictionAndResting(brique1, groundY);
  applyGroundFrictionAndResting(brique2, groundY);

  // Check for stacking
  brique1.resting = checkStacking(brique1, otherBriques) || brique1.resting;
  brique2.resting = checkStacking(brique2, otherBriques) || brique2.resting;
}
// export const collideRectangleRectangle = (brique1: Brique, brique2: Brique, groundY: number, otherBriques: Array<Brique>) => {
//   // Check for and handle collision
//   if (areRectanglesColliding(brique1, brique2)) {
//       let overlapX = calculateOverlap(brique1.coord.x, brique1.width, brique2.coord.x, brique2.width);
//       let overlapY = calculateOverlap(brique1.coord.y, brique1.height, brique2.coord.y, brique2.height);

//       const collisionPoint = { x: overlapX, y: overlapY , dx: 0, dy: 0};
//       const unbalanceFactor1 = calculateUnbalanceFactor(collisionPoint, brique1);
//       const unbalanceFactor2 = calculateUnbalanceFactor(collisionPoint, brique2);

//       // Resolve the smaller overlap
//       if (overlapX < overlapY) {
//           adjustPositionsX(brique1, brique2, overlapX);
//           handleCollisionEffects(brique1.coord.dx, brique2.coord.dx, brique1, brique2, unbalanceFactor1, unbalanceFactor2,collisionPoint);
//       } else {
//           adjustPositionsY(brique1, brique2, overlapY);
//           handleCollisionEffects(brique1.coord.dy, brique2.coord.dy, brique1, brique2, unbalanceFactor1, unbalanceFactor2,collisionPoint);
//       }
//   }

//   // Apply ground friction and check resting conditions
//   applyGroundFrictionAndResting(brique1, groundY);
//   applyGroundFrictionAndResting(brique2, groundY);

//   // Check for stacking
//   brique1.resting = checkStacking(brique1, otherBriques) || brique1.resting;
//   brique2.resting = checkStacking(brique2, otherBriques) || brique2.resting;
// }

// function handleCollisionEffects(vel1: number, vel2: number, brique1: Brique, brique2: Brique, unbalanceFactor1: number, unbalanceFactor2: number,collisionPoint: Coord) {
//   // Adjust velocities and rotation angles based on collision
//   const impulse1 = -(1 + conf.COEFFICIENT_OF_RESTITUTION) * (vel1 - vel2) / (1 / brique1.weight + 1 / brique2.weight);
//   const impulse2 = -(1 + conf.COEFFICIENT_OF_RESTITUTION) * (vel2 - vel1) / (1 / brique1.weight + 1 / brique2.weight);

//   brique1.coord.dx += (impulse1 / brique1.weight);
//   brique2.coord.dx -= (impulse2 / brique2.weight);

//   const torque1 = calculateTorque(brique1, unbalanceFactor1);
//   const rotationAngle1 = calculateRotationAngle(torque1, brique1,collisionPoint);
//   brique1.rotationAngle += rotationAngle1;

//   const torque2 = calculateTorque(brique2, unbalanceFactor2);
//   const rotationAngle2 = calculateRotationAngle(torque2, brique2,collisionPoint);
//   brique2.rotationAngle += rotationAngle2;
// }
function applyGravity(brick: Brique,collisionPoint : Coord) {
  const unbalanceFactor = 2; // Assume unbalanced for now
  const torque = calculateTorque(brick, unbalanceFactor);
  const rotationAngle = calculateRotationAngle(torque, brick, collisionPoint)
  brick.rotationAngle += rotationAngle; 
}

function calculateOverlap(pos1: number, size1: number, pos2: number, size2: number): number {
  if (pos1 < pos2) {
      return (pos1 + size1) - pos2;
  } else {
      return (pos2 + size2) - pos1;
  }
}

function adjustPositionsX(brique1: Brique, brique2: Brique, overlap: number): void {
  // Adjust positions to resolve collision along x-axis
  brique1.coord.x -= overlap / 2;
  brique2.coord.x += overlap / 2;
}

function adjustPositionsY(brique1: Brique, brique2: Brique, overlap: number): void {
  // Adjust positions to resolve collision along y-axis
  brique1.coord.y -= overlap / 2;
  brique2.coord.y += overlap / 2;
}

/**
* Simple axis-aligned rectangle collision check.
*/
function areRectanglesColliding(brique1: Brique, brique2: Brique): boolean {
  return brique1.coord.x < brique2.coord.x + brique2.width &&
      brique1.coord.x + brique1.width > brique2.coord.x &&
      brique1.coord.y < brique2.coord.y + brique2.height &&
      brique1.coord.y + brique1.height > brique2.coord.y;
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

const handleBallBriqueCollision = (ball: Ball, brique: Brique) => {
  if (!checkBallBriqueCollision(ball, brique)) {
    console.log("handleBallBriqueCollision: no collision detected");
    return;
  }
  
  // Determine the side of the brick where the collision occurred
  let collisionSide = determineCollisionSide(ball, brique);

  // Adjust the position of the ball to prevent it from being in collision with the brick
  if (collisionSide === 'left') {
    ball.coord.x = brique.coord.x - conf.RADIUS;
  } else if (collisionSide === 'right') {
    ball.coord.x = brique.coord.x + brique.width + conf.RADIUS;
  } else if (collisionSide === 'top') {
    ball.coord.y = brique.coord.y - conf.RADIUS;
  } else if (collisionSide === 'bottom') {
    ball.coord.y = brique.coord.y + brique.height + conf.RADIUS;
  }
  brique.coord.dx += ball.coord.dx;
  brique.coord.dy += ball.coord.dy + conf.GRAVITY * brique.weight;
  // Apply friction to the brick's horizontal velocity (dx)
  if (Math.abs(brique.coord.dx) > conf.VELOCITY_THRESHOLD) {
    brique.coord.dx *= conf.GROUND_FRICTION;
  } else {
    brique.coord.dx = 0;
  }
  // update la vie de la brique
  brique.life -= 1;
};

const handleBallPigCollision = (ball: Ball, pig: Pig) => {

  pig.coord.dx += ball.coord.dx;
  pig.coord.dy += ball.coord.dy;
  // update la vie de la brique
  pig.life -= 1;
};

function determineCollisionSide(ball: Ball, brique: Brique): string {
  let nearestX = Math.max(brique.coord.x, Math.min(ball.coord.x, brique.coord.x + brique.width));
  let nearestY = Math.max(brique.coord.y, Math.min(ball.coord.y, brique.coord.y + brique.height));

  let deltaX = ball.coord.x - nearestX;
  let deltaY = ball.coord.y - nearestY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return ball.coord.x < nearestX ? 'left' : 'right';
  } else {
    return ball.coord.y < nearestY ? 'top' : 'bottom';
  }
}

function checkPossibleMove(ball: Ball, obstacles: Array<Brique>, bound: Size): Coord {
  // Calculer la nouvelle position proposée
  let proposedPos = { x: ball.coord.x + ball.coord.dx, y: ball.coord.y + ball.coord.dy, dx: ball.coord.dx, dy: ball.coord.dy };

  // Vérification les limites du terrain de jeu
  if (proposedPos.x - conf.RADIUS < 0 || proposedPos.x + conf.RADIUS > bound.width) {
    proposedPos.x = ball.coord.x;
    ball.coord.dx *= -conf.COEFFICIENT_OF_RESTITUTION;
  }
  if (proposedPos.y - conf.RADIUS < 0 || proposedPos.y + conf.RADIUS > bound.height) {
    proposedPos.y = ball.coord.y;
    ball.coord.dy *= -conf.COEFFICIENT_OF_RESTITUTION;
  }

  // Vérifiecation les collisions avec les briques
  obstacles.forEach(obstacle => {
    if (checkBallBriqueCollision(ball, obstacle)) {
      // Détermination du  côté de la collision
      let collisionSide = determineCollisionSide(ball, obstacle);

      // ajustememnt de la position de la balle en fonction du côté de la collision
      if (collisionSide === 'left' || collisionSide === 'right') {
        proposedPos.x = collisionSide === 'left'
          ? obstacle.coord.x - conf.RADIUS
          : obstacle.coord.x + obstacle.width + conf.RADIUS;
        ball.coord.dx *= -conf.COEFFICIENT_OF_RESTITUTION;
      } else if (collisionSide === 'top' || collisionSide === 'bottom') {
        proposedPos.y = collisionSide === 'top'
          ? obstacle.coord.y - conf.RADIUS
          : obstacle.coord.y + obstacle.height + conf.RADIUS;
        ball.coord.dy *= -conf.COEFFICIENT_OF_RESTITUTION;
      }
    }
  });

  return { x: proposedPos.x, y: proposedPos.y, dx: ball.coord.dx, dy: ball.coord.dy };
}


function adjustPosition(initial: Coord, target: Coord, obstacleX: number, obstacleY: number): Coord {
  let angle = Math.atan2(target.y - obstacleY, target.x - obstacleX);
  return {
    x: obstacleX + Math.cos(angle) * conf.RADIUS,
    y: obstacleY + Math.sin(angle) * conf.RADIUS,
    dx: initial.dx,
    dy: initial.dy
  };
}


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
      //   console.log("collision detected");
      //   // let a = adjustPosition(ball.coord, brique.coord, brique.coord.x, brique.coord.y);
      //   handleBallBriqueCollision(ball, brique);
      //   // ball.coord = a;
      // }
        pig.life--;
        collideBallBrick(pig, brique);

      // collideBallRectangle(ball,brique,state.size.height,state.briques);
      }
    });
  });
  state.briques.forEach((brique, i, arr) => {
    arr.slice(i + 1).forEach((other) => {
      collideRectangleRectangle(other,brique, state.size.height,state.briques);
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

// const check_endGame = (state: State) => {
//   if ((state.pos.length === 0 && state.briques.length === 0) && (state.reserves.length === 0 && state.target === null)) {
//     return true
//   }
//   return false
// }

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
