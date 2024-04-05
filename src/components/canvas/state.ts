import * as conf from './conf'
type Coord = { x: number; y: number; dx: number; dy: number }
type Ball = {
  coord: Coord;
  life: number;
  weight: number; // Ajout du poids de la balle
  resting?: boolean;
  initDrag?: Coord;
  selectect?: boolean;
  invincible?: number;
  color?: string;
};

type Brique = {
  coord: Coord; 
  width: number;
  height: number;
  life: number;
  resting?: boolean;
  initDrag?: Coord;
  selectect?: boolean;
  invincible?: number;
  color?: string;
};
type Size = { height: number; width: number }
export type State = {
  pos: Array<Ball>
  briques : Array<Brique>
  size: Size
  endOfGame: boolean
}

var beginOfGame = false;

const dist2 = (o1: Coord, o2: Coord) =>
  Math.pow(o1.x - o2.x, 2) + Math.pow(o1.y - o2.y, 2)

  const iterate = (bound: Size) => (ball: Ball, briques: Array<Brique>) => {
    if (ball.selectect) {
        return ball;
    }

    let coord = { ...ball.coord };

    // Appliquer la gravité
    if (!ball.resting) {
        coord.dy += conf.GRAVITY * ball.weight;
    }

    // Appliquer la résistance de l'air de manière différente selon la direction
    if (coord.dy > 0) {
        // Descendre : la résistance de l'air ralentit moins la balle
        coord.dy *= conf.AIR_FRICTION_DESCENDING;
    } else {
        // Monter : la résistance de l'air ralentit plus la balle
        coord.dy *=  conf.AIR_FRICTION_ASCENDING;
    }

    // Appliquer la résistance de l'air horizontalement
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
    } else {
      if (beginOfGame) {
        ball.resting = false;
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

  
  const iterate2 = (bound: Size) => (ball: Brique) => {
    return ball;
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

  // Déterminer le côté de la brique sur lequel la collision a eu lieu
  let collisionSide = determineCollisionSide(ball, brique);
  console.log("collisionSide: " + collisionSide)

  // Mettre à jour la direction de la balle en fonction du côté de la collision
  if (collisionSide === 'left' || collisionSide === 'right') {
    // Collision sur le côté gauche ou droit de la brique, inverser la vitesse horizontale
    ball.coord.dx *= -conf.SQUARE_RESTITUTIONt;
    console.log("collisionSide: " + collisionSide + ", ball.coord.x: " + ball.coord.x + ", brique.coord.x: " + brique.coord.x + ", brique.width: " + brique.width)

    // if (ball.coord.y)
    // Ajuster la position pour éviter que la balle ne pénètre dans la brique
    ball.coord.x = collisionSide === 'left' 
      ? brique.coord.x - conf.RADIUS 
      : brique.coord.x + brique.width + conf.RADIUS;
  } else if (collisionSide === 'top' || collisionSide === 'bottom') {
    console.log("collisionSide: " + collisionSide + ", ball.coord.y: " + ball.coord.y + ", brique.coord.y: " + brique.coord.y + ", brique.height: " + brique.height)
    // Collision sur le côté haut ou bas de la brique, inverser la vitesse verticale
    ball.coord.dy *= -conf.SQUARE_RESTITUTIONt;
    // Ajuster la position pour éviter que la balle ne pénètre dans la brique
    ball.coord.y = collisionSide === 'top' 
      ? brique.coord.y - conf.RADIUS 
      : brique.coord.y + brique.height + conf.RADIUS;
  }

  // Diminuer la vie de la brique
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

  // Vérifier les limites du terrain de jeu
  if (proposedPos.x - conf.RADIUS < 0 || proposedPos.x + conf.RADIUS > bound.width) {
    proposedPos.x = ball.coord.x;
    ball.coord.dx *= -conf.COEFFICIENT_OF_RESTITUTION;
  }
  if (proposedPos.y - conf.RADIUS < 0 || proposedPos.y + conf.RADIUS > bound.height) {
    proposedPos.y = ball.coord.y;
    ball.coord.dy *= -conf.COEFFICIENT_OF_RESTITUTION;
  }

  // Vérifier les collisions avec les briques
  obstacles.forEach(obstacle => {
    if (checkBallBriqueCollision(ball, obstacle)) {
      // Déterminer le côté de la collision
      let collisionSide = determineCollisionSide(ball, obstacle);

      // Ajuster la position de la balle en fonction du côté de la collision
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




export const step = (state: State) => {
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


  
  return {
    ...state,
    pos: state.pos.map(ball => iterate(state.size)(ball, state.briques)).filter((p) => p.life > 0),
    briques: state.briques.map(iterate2(state.size)).filter((p) => p.life > 0),
  }
}


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

export const mouseMove =
  (state: State) =>
  (event: PointerEvent): State => {
    const { offsetX, offsetY } = event
    const target = state.pos.find(
      (p) =>
        p.selectect === true
    )
    if (target && target.selectect) {
      target.coord.x = offsetX
      target.coord.y = offsetY
    }
    return state
  }

export const mouseup =
  (state: State) =>
  (event: PointerEvent): State => {
    const { offsetX, offsetY } = event
    console.log("voila")
    const target = state.pos.find(
      (p) =>
        p.selectect === true,
    )
    if (target) {
      if (target.initDrag){
        target.selectect = false
        target.coord.dx = (target.initDrag.x - offsetX) / 10
        target.coord.dy = (target.initDrag.y - offsetY) / 10
        console.log(target.coord.x , target.coord.y)
        console.log(target.coord.dx , target.coord.dy)
        console.log("released", target.coord)
      }
    }

    beginOfGame = true;
    console.log("event", event.x, event.y)
    return state
  }

export const endOfGame = (state: State): boolean => true
