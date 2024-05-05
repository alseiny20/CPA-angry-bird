import * as conf from './conf'
export type Coord = { x: number; y: number; dx: number; dy: number }
export type Point = { x: number; y: number }

export type Bird = {
  coord: Coord;
  life: number;
  weight: number;
  target?: boolean; 
  resting?: boolean;
  initDrag?: Coord;
  selectect?: boolean;
  invincible?: number;
  image?: string;
  radius: number;
  alpha?: number;
};
export type Pig = {
  coord: Coord;
  life: number;
  weight: number; 
  target?: boolean; 
  resting?: boolean;
  initDrag?: Coord;
  selectect?: boolean;
  invincible?: number;
  radius: number;
  alpha?: number;
};

export type Brick = {
  coord: Coord; 
  width: number;
  height: number;
  weight: number; 
  life: number;
  resting?: boolean;
  initDrag?: Coord;
  selectect?: boolean;
  invincible?: number;
  image: string;
  alpha : number;
  dr : number;
};

type Size = { height: number; width: number }

export type State = {
  birds: Array<Bird> 
  pigs: Array<Pig>
  bricks : Array<Brick>
  reserves: Array<Bird>
  target: Bird | null
  shoot: Array<Coord> | null
  size: Size
  endOfGame: boolean
  win: boolean
}
var inTurn = true;

const dist2 = (o1: Coord, o2: Coord) =>
  Math.pow(o1.x - o2.x, 2) + Math.pow(o1.y - o2.y, 2)

const iterateBird = (bound: Size) => (bird: Bird) => {
  let coord = { ...bird.coord };

  // appliation la gravité
  if (!bird.resting) {
      coord.dy += conf.GRAVITY * bird.weight;
  }

  // résistance de l'air de manière différente selon la direction
  if (coord.dy > 0) {
      // Descendre : la résistance de l'air ralentit moins la birde
      coord.dy *= conf.AIR_FRICTION_DESCENDING;
  } else {
      // Monter : la résistance de l'air ralentit plus la birde
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

      // Appliquer le frottement au sol si la birde est au repos
      if (Math.abs(coord.dy) < conf.VELOCITY_THRESHOLD) {
          coord.dy = 0;
          bird.resting = true;
          if (Math.abs(coord.dx) > conf.VELOCITY_THRESHOLD) {
              coord.dx *= conf.GROUND_FRICTION;
          } else {
              coord.dx = 0;
          }
      }
  }

  bird.invincible = bird.invincible ? bird.invincible - 1 : 0;

  return {
      ...bird,
      coord: coord
  };
};
export function getRotatedRectanglePoints(brick: Brick): Point[] {
  const points: Point[] = [];
  const angle = brick.alpha * Math.PI / 180; // Conversion de degrés en radians
  const cx = brick.coord.x + brick.width / 2; // Centre x de la brick
  const cy = brick.coord.y + brick.height / 2; // Centre y de la brick

  // Coins de la brick avant rotation
  const corners = [
      { x: brick.coord.x, y: brick.coord.y },
      { x: brick.coord.x + brick.width, y: brick.coord.y },
      { x: brick.coord.x + brick.width, y: brick.coord.y + brick.height },
      { x: brick.coord.x, y: brick.coord.y + brick.height }
  ];

  // Calculer les coins rotés
  corners.forEach(corner => {
      const rotatedX = Math.cos(angle) * (corner.x - cx) - Math.sin(angle) * (corner.y - cy) + cx;
      const rotatedY = Math.sin(angle) * (corner.x - cx) + Math.cos(angle) * (corner.y - cy) + cy;
      points.push({ x: rotatedX, y: rotatedY });
  });

  return points;
}

const iterateBrick = (bound: Size) => (brick: Brick, otherBricks: Array<Brick>) => {
  if (brick.resting) {
      return brick;
  }
  let coord = { ...brick.coord };
// Calcul centre de gravité
let gravityCenterX = coord.x + brick.width / 2; // Centre de la brick le long de l'axe x
let gravityCenterY = coord.y + brick.height / 2; // Centre de la brick le long de l'axe y

// Appliquer la gravité au centre de gravité
coord.dy += conf.GRAVITY * brick.weight;

// Appliquer la résistance de l'air en fonction de la direction
const airFriction = coord.dy > 0 ? conf.AIR_FRICTION_DESCENDING : conf.AIR_FRICTION_ASCENDING;
coord.dy *= airFriction;
coord.dx *= conf.AIR_FRICTION_HORIZONTAL;

// Mise à jour des positions
gravityCenterX += coord.dx;
gravityCenterY += coord.dy;

// Mise à jour des coordonnées de la brick en fonction du centre de gravité
coord.x = gravityCenterX - brick.width / 2;
coord.y = gravityCenterY - brick.height / 2;

  // Gestion des collisions avec les bords horizontaux et amortissement
  if (coord.x < 0 || coord.x + brick.width > bound.width) {
      brick.coord.dx *= -conf.COEFFICIENT_OF_RESTITUTION;
      coord.x = Math.max(coord.x, 0);
      coord.x = Math.min(coord.x, bound.width - brick.width);
  }

  if (coord.y < 0 || coord.y + brick.height > bound.height) {
      brick.coord.dy *= -conf.COEFFICIENT_OF_RESTITUTION;
      coord.y = Math.max(coord.y, 0);
      coord.y = Math.min(coord.y, bound.height - brick.height);
  }

  // Gestion des collisions avec les autres briques 
  const restingOnGround = coord.y + brick.height >= bound.height;
  const restingOnOtherBrick = otherBricks.some((other) => {
      return (
          brick !== other &&
          coord.y + brick.height >= other.coord.y &&
          coord.y <= other.coord.y + other.height &&
          coord.x + brick.width > other.coord.x &&
          coord.x < other.coord.x + other.width
      );
  });

  if (restingOnGround || restingOnOtherBrick) {
      coord.dy = 0;
      coord.y = restingOnGround
          ? bound.height - brick.height
          : Math.min(
              ...otherBricks
                  .filter(
                      (other) =>
                          brick !== other &&
                          coord.y + brick.height >= other.coord.y &&
                          coord.y <= other.coord.y + other.height &&
                          coord.x + brick.width > other.coord.x &&
                          coord.x < other.coord.x + other.width
                  )
                  .map((other) => other.coord.y - brick.height)
          );
             // Appliquer le frottement au sol si la brick est au repos
      if (restingOnGround) {
        coord.dx *= conf.GROUND_FRICTION;
        
      }
  }

  // Mis à jour de la rotation
  // on applique la friction de l'air
  if (brick.dr > 0) {
    brick.dr -= conf.ROTATIONFRICTION;
  }else if (brick.dr < 0) {
    brick.dr += conf.ROTATIONFRICTION;
  }
  // on applique un modulo pour maintenir l'angle entre 0 et 180 
  brick.alpha = brick.alpha % 180
  // valeur absolue de dr 
  if (Math.abs(brick.dr) > conf.ROTATIONFRICTION) {
    brick.alpha += brick.dr
  }
  // si la valeur de rotations est trop faible on l'arrondie 
  if (Math.abs(brick.dr) < conf.ROTATIONFRICTION) {
    brick.dr = 0;
  }
  // on clean les brick hors du cadreà
  cleanUnconformePosition(brick, bound.width, bound.height);

  // on arete la brick si sont mouvement est trop faible
  if (Math.abs (brick.coord.x) < conf.MINMOVE && Math.abs (brick.coord.y) < conf.MINMOVE) {
    brick.coord.dx = 0;
    brick.coord.dy = 0;
    brick.resting = true;
  }

  return {  
      ...brick,
      coord: coord,
  };
};

  const iteratePig = (bound: Size) => (pig: Pig) => {
    let coord = { ...pig.coord };
    // appliation la gravité
        coord.dy += conf.GRAVITY * pig.weight;
    // résistance de l'air de manière différente selon la direction
    if (coord.dy > 0) {
        // Descendre : la résistance de l'air ralentit moins la birde
        coord.dy *= conf.AIR_FRICTION_DESCENDING;
    } else {
        // Monter : la résistance de l'air ralentit plus la birde
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

        // Appliquer le frottement au sol si la birde est au repos
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

  export const collideCircleCircle = (bird1: Coord, bird2: Coord) => {
    const dx = bird2.x - bird1.x;
    const dy = bird2.y - bird1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calcul de la normale et de la tangente à la collision
    const nx = dx / distance;
    const ny = dy / distance;
    const gx = -ny;
    const gy = nx;

    // Calcul des vitesses normales et tangentes avant la collision
    const v1n = nx * bird1.dx + ny * bird1.dy;
    const v2n = nx * bird2.dx + ny * bird2.dy;
    const v1g = gx * bird1.dx + gy * bird1.dy;
    const v2g = gx * bird2.dx + gy * bird2.dy;

    // Calcul des vitesses normales après la collision
    bird1.dx = nx * v2n + gx * v1g;
    bird1.dy = ny * v2n + gy * v1g;
    bird2.dx = nx * v1n + gx * v2g;
    bird2.dy = ny * v1n + gy * v2g;

    // Correction de la position pour éviter la superposition
    const overlap = 2 * conf.RADIUS - distance;
    const correctionFactor = overlap / 2;
    bird1.x -= correctionFactor * nx;
    bird1.y -= correctionFactor * ny;
    bird2.x += correctionFactor * nx;
    bird2.y += correctionFactor * ny;
}

export const collideCircleRectangle = (bird: Bird, brick: Brick): {collide: boolean, bird: Bird} => {
  // Calcul de l'angle de rotation en radians
  const angle = -brick.alpha * Math.PI / 180;

  // Calcul des coordonnées du centre de la balle après rotation
  const rotatedBallX = Math.cos(angle) * (bird.coord.x - (brick.coord.x + brick.width / 2)) -
                       Math.sin(angle) * (bird.coord.y - (brick.coord.y + brick.height / 2)) +
                       (brick.coord.x + brick.width / 2);

  const rotatedBallY = Math.sin(angle) * (bird.coord.x - (brick.coord.x + brick.width / 2)) +
                       Math.cos(angle) * (bird.coord.y - (brick.coord.y + brick.height / 2)) +
                       (brick.coord.y + brick.height / 2);

  // Calcul des coordonnées les plus proches du centre de la balle par rapport au rectangle après rotation
  const nearestX = Math.max(brick.coord.x, Math.min(rotatedBallX, brick.coord.x + brick.width));
  const nearestY = Math.max(brick.coord.y, Math.min(rotatedBallY, brick.coord.y + brick.height));

  const deltaX = rotatedBallX - nearestX;
  const deltaY = rotatedBallY - nearestY;
  const distanceSquared = deltaX * deltaX + deltaY * deltaY;
  const radiusSquared = bird.radius * bird.radius;

  if (distanceSquared <= radiusSquared) {
      const distance = Math.sqrt(distanceSquared);
      const nx = deltaX / distance;
      const ny = deltaY / distance;

      // Calcul de la vitesse relative
      const relativeVelX = bird.coord.dx - brick.coord.dx;
      const relativeVelY = bird.coord.dy - brick.coord.dy;
      const velAlongNormal = relativeVelX * nx + relativeVelY * ny;

      if (velAlongNormal < 0 && !bird.invincible) {
          // Correction de la position pour éviter la superposition
          const overlap = bird.radius - distance;
          bird.coord.x += overlap * nx;
          bird.coord.y += overlap * ny;

          // Réduire la vie de la balle
          brick.life--;

          // Calcul de l'impulsion basée sur la vitesse relative et mise à jour de la vitesse de la balle
          const impulse = -(1 + conf.COEFFICIENT_OF_RESTITUTION) * velAlongNormal / (1 / bird.weight + 1 / brick.weight);
          bird.coord.dx += (impulse / bird.weight) * nx;
          bird.coord.dy += (impulse / bird.weight) * ny;

          bird.invincible = 1;  // Activer l'invincibilité pour éviter les collisions multiples

          // Calcul de l'impulsion de rotation basée sur le point d'impact
          const brickImpulse = (1 + conf.COEFFICIENT_OF_RESTITUTION) * velAlongNormal / (1 / bird.weight + 1 / brick.weight);
          brick.coord.dx += (brickImpulse / brick.weight) * nx;
          brick.coord.dy += (brickImpulse / brick.weight) * ny;

          // Calcul de l'impulsion de rotation basée sur le point d'impact, ajustée pour l'effet de bras de levier
            const centerOfBrickX = brick.coord.x + brick.width / 2;
            const centerOfBrickY = brick.coord.y + brick.height / 2;
            const leverArmX = nearestX - centerOfBrickX;
            const leverArmY = nearestY - centerOfBrickY;
            const torque = leverArmX * ny - leverArmY * nx; // Produit vectoriel entre le bras de levier et la normale

            //Mis à jour de la vitesse de rotation 
            brick.dr -= torque / (brick.weight * Math.sqrt(leverArmX * leverArmX + leverArmY * leverArmY));
            return {collide : true, bird: bird};  
        }
  } else {
      bird.invincible = 0; // Désactiver l'invincibilité si la balle n'est pas en collision
  }
  return {collide : false, bird: bird};
};
 
function arePolygonsColliding(points: Point[], brick: Brick): boolean {
  // Implémenter SAT pour vérifier la collision un point et un polygone
  const axes = getAxes(points)
  const brickPoints = getRotatedRectanglePoints(brick);
  const brickAxes = getAxes(brickPoints);
  
  for (let i = 0; i < axes.length; i++) {
      const axis = axes[i];
      const projection1 = projectPolygon(axis, points);
      const projection2 = projectPolygon(axis, brickPoints);

      if (!isOverlapping(projection1, projection2)) {
          return false;
      }
  }

  for (let i = 0; i < brickAxes.length; i++) {
      const axis = brickAxes[i];
      const projection1 = projectPolygon(axis, points);
      const projection2 = projectPolygon(axis, brickPoints);

      if (!isOverlapping(projection1, projection2)) {
          return false;
      }
  }

  return true;
}
export const collideRectangleRectangle= (brick1: Brick, brick2: Brick) => {
  const points1 = getRotatedRectanglePoints(brick1);
  const points2 = getRotatedRectanglePoints(brick2);

  if (arePolygonsColliding(points1, brick2)) {
      handleCollisionResponse(brick1, brick2);
  }
  if (arePolygonsColliding(points2, brick1)) {
    handleCollisionResponse(brick2, brick1);
  }
};

function pointBall(point: Point, dx: number, dy: number): Bird {
  return {
    coord: {
      x: point.x,
      y: point.y,
      dx: dx,
      dy: dy
    },
    life: 10,
    weight: 0.5,
    radius: 50,
    resting: false,
    invincible: 0

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

function handleCollisionResponse(brick1: Brick, brick2: Brick) {
  const points1 = getRotatedRectanglePoints(brick1);
  const points2 = getRotatedRectanglePoints(brick2);
  let testColide;

  // Collision check et réaction pour chaque point de brick1 contre brick2
  for (const point of points1) {
    testColide = collideCircleRectangle(pointBall(point, brick1.coord.dx, brick1.coord.dy), brick2)

    //  si il ya eu une colision on ajuste la position de la brick
    if (testColide.collide) {
     break;
    }
  }

  if (!testColide?.collide) { // Seulement vérifier la deuxième brick si aucune collision n'a été trouvée auparavant
    for (const point of points2) {
      testColide = collideCircleRectangle(pointBall(point, brick2.coord.dx, brick2.coord.dy), brick1)
      if (testColide.collide) {
        break;
      }
    }
  }
}

  
const checkCircleRectangleCollision = (circle: Bird, rect: Brick) => {
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
      birds: [...state.birds, {...newTarget, coord: { ...conf.COORD_TARGET, dx: 0, dy: 0 }}],
    };
  }
  return state;
};

export const step = (state: State) => {
  if (!inTurn){
    if (state.birds.length <= 0  && state.reserves.length <= 0 && state.target == null || state.pigs.length <= 0){
      return {...state, endOfGame: true, win: state.pigs.length <= 0};
    }
    state = choose_new_target(state);
  }

  state.birds.map((p1, i, arr) => {
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
        collideCircleCircle(p1.coord, p2.coord)
      }
    })
    
    state.birds.forEach((bird) => {
      state.bricks.forEach((brick) => {
          collideCircleRectangle(bird, brick);
      });

      state.pigs.forEach((pig) => {
        if (collide(bird.coord, pig.coord)) {
          if (!bird.invincible) {
            bird.life--
            bird.invincible = 20
          }
          if (!pig.invincible) {
            pig.life--
            pig.invincible = 20
          }
          collideCircleCircle(bird.coord, pig.coord);
        }
      });
    });
  })

  state.pigs.forEach((pig) => {
    state.bricks.forEach((brick) => {
      if (checkCircleRectangleCollision(pig, brick)) {
        pig.life--;
        collideCircleRectangle(pig, brick);
      }
    });
  });

  state.bricks.forEach((brick, i, arr) => {
    arr.slice(i + 1).forEach((other) => {
      collideRectangleRectangle(other,brick);//, state.size,state.bricks);
    });
  });

  inTurn = !check_endTurn(state)

  var birds = state.birds.map(bird => iterateBird(state.size)(bird)).filter((p) => p.life > 0);

  if (!inTurn) {
    birds = birds.filter((bird) => bird.target === false || !bird.target)
  }
  var pigs = state.pigs.map(iteratePig(state.size)).filter(p => p.life > 0)
  // s'il ya un shoot en cour met a jour la trajectoir
  var bricks =state.bricks.map((brick: Brick) => iterateBrick(state.size)(brick, state.bricks)).filter(p => p.life > 0)
  const newState = {
    ...state,
    birds: birds,
    pigs: pigs,
    bricks: bricks,
  };

  return newState;
};

const cleanUnconformePosition = (brick: Brick, width: number, height: number) => {
  // si la brick est en collision avec le sole et que aucune de ces coté n'est par terre
  const rotationAngle = getRotatedRectanglePoints(brick);
  if (brick.coord.y + brick.height >= height ) {     // si la brick est en collision avec le sol
    let contacteSol = false;
    rotationAngle.forEach((point) => {
      if (point.y >= height - 5) {
        contacteSol = true;
      }
    });

    if (!contacteSol) {
      // on tue la brick
      brick.life = 0;
    }
  }
  // s'il ya un point de la brick en rotation est en dehors de la zone de jeu on le tue
  rotationAngle.forEach((point) => {
    if (point.x < 0 ||  point.y > height+50 || point.x > width ) {
      brick.life = 0;
    }
  });

  // tout brick qui tendrais vers la rampe de lancement est tué
  if (brick.coord.x < conf.COORD_TARGET.x) {
    brick.life = 0;
  }
  
} 

// fonction qui permet de trouver le chemin de l'oiseau
function findPath(target: Bird): Array<Coord> {
  var path = new Array<Coord>()
  var bird = { ...target }
  for (var i = 0; i < conf.MAX_PATH; i++) {
    path.push({ x: bird.coord.x, y: bird.coord.y, dx: bird.coord.dx, dy: bird.coord.dy })
    bird = iterateBird({ height: 5000, width: 5000 })(bird)
    bird = iterateBird({ height: 5000, width: 5000 })(bird)
  }
  return path
}
const hasMoved = (bird: Bird ) => bird.coord.dx !== 0 || bird.coord.dy !== 0 

const check_endTurn = (state: State) => {
  const birdsMoved = state.birds.some(hasMoved);
  const pigsMoved = state.pigs.some(hasMoved);
  return !birdsMoved && !pigsMoved && state.target === null;
};


// fonctions d'interaction utilisateur  --------

export const click =
  (state: State) =>
  (event: PointerEvent): State => {
    const { offsetX, offsetY } = event
    const target = state.birds.find(
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
    const target = state.birds.find(
      (p) =>
        dist2(p.coord, { x: offsetX, y: offsetY, dx: 0, dy: 0 }) <
        Math.pow(conf.RADIUS, 2) + 100
    )
    if (target) {
      target.selectect = true
      target.initDrag = { x: offsetX, y: offsetY, dx: 0, dy: 0 }
    }
    return state
  }

  export const mouseMove = (state: State) => (event: PointerEvent): State => {
    const { offsetX, offsetY } = event;
    const target = state.birds.find((p) => p.selectect === true);

    if (target && target.selectect && target.initDrag) {
        const dx = offsetX - target.initDrag.x;
        const dy = offsetY - target.initDrag.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

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
        return { ...state, birds: state.birds, shoot: path };
    }

    return state;
};

export const mouseup = (state: State) => (event: PointerEvent): State => {

  let isBeginOfGame = false;

  const updatedBirds = state.birds.map((p) => {
    if (p.selectect) {
      const dx = p.initDrag ? (p.initDrag.x - p.coord.x) / 10 : p.coord.dx;
      const dy = p.initDrag ? (p.initDrag.y - p.coord.y) / 10 : p.coord.dy;
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

  return { ...state, birds: updatedBirds, shoot: null, target:  isBeginOfGame ? null : state.target };
};


export const endOfGame = (state: State): boolean => {
  return (state.reserves.length === 0 && (state.birds.filter((p) => p.coord.dx !== 0 && p.coord.dy !== 0).length === 0 && state.target === null)) || state.pigs.length <= 0;
}
