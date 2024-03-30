import * as conf from './conf'
type Coord = { x: number; y: number; dx: number; dy: number }
type Ball = { coord: Coord;  life: number;resting? : boolean; initDrag?: Coord; selectect?: boolean; invincible?: number, color?: string}
type Size = { height: number; width: number }
export type State = {
  pos: Array<Ball>
  size: Size
  endOfGame: boolean
}

const dist2 = (o1: Coord, o2: Coord) =>
  Math.pow(o1.x - o2.x, 2) + Math.pow(o1.y - o2.y, 2)

  const iterate = (bound: Size) => (ball: Ball) => {
    // Retour immédiat de la balle si elle est sélectionnée pour éviter toute modification.
    if (ball.selectect) {
      return ball;
    }
  
    const coord = ball.coord;
  
    // Application de la gravité si la balle n'est pas au repos.
    if (!ball.resting) {
      coord.dy += conf.GRAVITY;
    }
  
    // Application de la friction de l'air.
    coord.dx *= conf.AIR_FRICTION;
    coord.dy *= conf.AIR_FRICTION;
  
    // Mise à jour des positions x et y selon les vitesses dx et dy.
    coord.x += coord.dx;
    coord.y += coord.dy;
  
    // Gestion des collisions avec les bords horizontaux et amortissement.
    if (coord.x - conf.RADIUS < 0 || coord.x + conf.RADIUS > bound.width) {
      coord.dx *= -conf.COEFFICIENT_OF_RESTITUTION;
      coord.x = Math.max(coord.x, conf.RADIUS);
      coord.x = Math.min(coord.x, bound.width - conf.RADIUS);
    }
  
    // Gestion des collisions avec le bord supérieur et amortissement.
    if (coord.y - conf.RADIUS < 0) {
      coord.dy *= -conf.COEFFICIENT_OF_RESTITUTION;
      coord.y = Math.max(coord.y, conf.RADIUS);
    }
  
    // Gestion des collisions avec le sol, amortissement et vérification de l'état au repos.
    if (coord.y + conf.RADIUS >= bound.height) {
      coord.dy *= -conf.COEFFICIENT_OF_RESTITUTION;
      coord.y = bound.height - conf.RADIUS;
  
      // Application du frottement cinétique si la balle est au repos.
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
      ball.resting = false;
    }
  
    // Réduction de l'invincibilité si elle est active.
    ball.invincible = ball.invincible ? ball.invincible - 1 : 0;
  
    // Retour de la balle avec les mises à jour appliquées.
    return {
      ...ball,
      coord: { ...coord },
    };
  };
  
  
  


const collide = (o1: Coord, o2: Coord) =>
  dist2(o1, o2) < Math.pow(2 * conf.RADIUS, 2)

const collideBoing = (p1: Coord, p2: Coord) => {
  const nx = (p2.x - p1.x) / (2 * conf.RADIUS)
  const ny = (p2.y - p1.y) / (2 * conf.RADIUS)
  const gx = -ny
  const gy = nx

  const v1g = gx * p1.dx + gy * p1.dy
  const v2n = nx * p2.dx + ny * p2.dy
  const v2g = gx * p2.dx + gy * p2.dy
  const v1n = nx * p1.dx + ny * p1.dy
  p1.dx = nx * v2n + gx * v1g
  p1.dy = ny * v2n + gy * v1g
  p2.dx = nx * v1n + gx * v2g
  p2.dy = ny * v1n + gy * v2g
  p1.x += p1.dx
  p1.y += p1.dy
  p2.x += p2.dx
  p2.y += p2.dy
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
  })
  return {
    ...state,
    pos: state.pos.map(iterate(state.size)).filter((p) => p.life > 0),
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
    return state
  }

export const endOfGame = (state: State): boolean => true
