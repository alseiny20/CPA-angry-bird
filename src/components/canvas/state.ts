import { stat } from 'fs';
import * as conf from './conf'
import path from 'path';
export type Coord = { x: number; y: number; dx: number; dy: number }
type Ball = {
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
  radius?: number;
  alpha?: number;
};

type Brique = {
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
};

type Size = { height: number; width: number }

export type State = {
  pos: Array<Ball>
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
    // if (ball.selectect) {
    //     console.log('balllong', ball.selectect);
    //     return ball;
    // }

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

  const iterate2 = (bound: Size) => (brique: Brique) => {
    // return brique;
    // Check if the brick is resting, don't update its position if it's resting
  if (brique.resting) {
    return brique;
  }
  let coord = { ...brique.coord };

  // appliation la gravité
  if (!brique.resting) {
      coord.dy += conf.GRAVITY * brique.weight;
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
  // Update the position of the brick based on its velocity
  coord.x += brique.coord.dx;
  coord.y += brique.coord.dy;

  // Check for collisions with boundaries and adjust if necessary
  // Implement collision logic with boundaries if needed

  // Check for collisions with the left or right boundaries
  if (coord.x < 0 || coord.x + brique.width > bound.width) {
    brique.coord.dx *= -conf.COEFFICIENT_OF_RESTITUTION;  // Reverse and dampen the horizontal velocity
    coord.x = Math.max(coord.x, 0);
    coord.x = Math.min(coord.x, bound.width - brique.width);
  }

  // Check for collisions with the top or bottom boundaries
  if (coord.y < 0 || coord.y + brique.height > bound.height) {
    brique.coord.dy *= -conf.COEFFICIENT_OF_RESTITUTION;  // Reverse and dampen the vertical velocity
    coord.y = Math.max(coord.y, 0);
    coord.y = Math.min(coord.y, bound.height - brique.height);
  }
  return {
    ...brique,
    coord: coord,
  };
  }
  
const collide = (o1: Coord, o2: Coord) =>
  dist2(o1, o2) < Math.pow(2 * conf.RADIUS, 2)

  export const collideBoing = (p1: Coord, p2: Coord) => {
    const nx = (p2.x - p1.x) / (2 * conf.RADIUS);
    const ny = (p2.y - p1.y) / (2 * conf.RADIUS);
    const gx = -ny;
    const gy = nx;
  
    const v1g = gx * p1.dx + gy * p1.dy;
    const v2n = nx * p2.dx + ny * p2.dy;
    const v2g = gx * p2.dx + gy * p2.dy;
    const v1n = nx * p1.dx + ny * p1.dy;
  
    // Mise à jour des vitesses après collision
    p1.dx = nx * v2n + gx * v1g;
    p1.dy = ny * v2n + gy * v1g;
    p2.dx = nx * v1n + gx * v2g;
    p2.dy = ny * v1n + gy * v2g;
  
    // Ajustement des positions pour éviter le chevauchement
    const overlap = 2 * conf.RADIUS - Math.sqrt(dist2(p1, p2));
    const correctionFactor = overlap / 2;
  
    p1.x -= correctionFactor * nx;
    p1.y -= correctionFactor * ny;
    p2.x += correctionFactor * nx;
    p2.y += correctionFactor * ny;
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
}

const handleBallBriqueCollision = (ball: Ball, brique: Brique) => {
  if (!checkBallBriqueCollision(ball, brique)) {
    console.log("handleBallBriqueCollision: no collision detected");
    return;
  }

  // // Déterminer le côté de la brique sur lequel la collision a eu lieu
  // let collisionSide = determineCollisionSide(ball, brique);
  // // let normalX = - 5, normalY = -5;
  // let normalX = 0, normalY = 0;
  // // Ajuster la position de la balle pour éviter qu'elle ne soit plus en collision avec la brique
  // if (collisionSide === 'left') {
  //   normalX = -1; normalY = 0;
  //   ball.coord.x = brique.coord.x - conf.RADIUS;
  // } else if (collisionSide === 'right') {
  //   normalX = 1; normalY = 0;
  //   ball.coord.x = brique.coord.x + brique.width + conf.RADIUS;
  // } else if (collisionSide === 'top') {
  //   normalX = 0; normalY = -1;
  //   ball.coord.y = brique.coord.y - conf.RADIUS;
  // } else if (collisionSide === 'bottom') {
  //   normalX = 0; normalY = 1;
  //   ball.coord.y = brique.coord.y + brique.height + conf.RADIUS;
  // }

  // // Inversersion la composante de la vitesse de la balle qui est parallèle à la normale
  // const dotProduct = ball.coord.dx * normalX + ball.coord.dy * normalY;
  // ball.coord.dx -= 2 * dotProduct * normalX;
  // ball.coord.dy -= 2 * dotProduct * normalY;

  // //coefficient de restitution pour le rebond
  // ball.coord.dx *= conf.SQUARE_RESTITUTION;
  // ball.coord.dy *= conf.SQUARE_RESTITUTION;
  
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
  // // Push the brick in the opposite direction of the collision
  brique.coord.dx += ball.coord.dx;
  brique.coord.dy += ball.coord.dy;

  // update la vie de la brique
  brique.life -= 1;
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
    if (state.pos.length === 0 && state.briques.length === 0 && state.reserves.length === 0 && state.target === null){
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
        collideBoing(p1.coord, p2.coord)
      }
    })
    
    state.pos.forEach((ball) => {
      state.briques.forEach((brique) => {
        if (checkBallBriqueCollision(ball, brique)) {
          console.log("collision detected");
          // let a = adjustPosition(ball.coord, brique.coord, brique.coord.x, brique.coord.y);
          handleBallBriqueCollision(ball, brique);
          // ball.coord = a;
        }
      });
    });
   
  })

  state.briques.forEach((p1, i, arr) => {
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
        collideBoing(p1.coord, p2.coord)
      }
    })
  })
  inTurn = !check_endTurn(state)

  var balls = state.pos.map(ball => iterate(state.size)(ball, state.briques)).filter((p) => p.life > 0);

  if (!inTurn) {
    balls = balls.filter((ball) => ball.target === false || !ball.target)
  }

  // s'il ya un shoot en cour met a jour la trajectoir
  
  const newState = {
    ...state,
    pos: balls,
    briques: state.briques.map(iterate2(state.size)).filter(p => p.life > 0),
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
  return !(state.reserves.length === 0 && (state.pos.filter((p) => p.coord.dx !== 0 && p.coord.dy !== 0).length === 0 && state.target === null));
}
