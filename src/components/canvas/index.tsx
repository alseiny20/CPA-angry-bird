import * as conf from './conf'
import { useRef, useEffect } from 'react'
import { State, step, click, mouseMove, endOfGame, mousedown, mouseup } from './state'
import { render } from './renderer'

export const randomInt = (max: number) => Math.floor(Math.random() * max)
export const randomSign = () => Math.sign(Math.random() - 0.5) // cette random ren

const initCanvas =
  (iterate: (ctx: CanvasRenderingContext2D) => void) =>
  (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    requestAnimationFrame(() => iterate(ctx))
  }
function randomChoice<T>(list: T[]): T {
    const index = Math.floor(Math.random() * list.length);
    return list[index];
}
 
const Canvas = ({ height, width }: { height: number; width: number }) => {
 
  // intialisation des balles
  let position = 20;
  const getPosition = () => {
    position = position + 60;
    return position;
  }
  
  // var radius =  30;
  // const getRadius = () => {
  //   radius = randomInt(40)
  //   return radius;
  // }

  // const getAlpha = () => {
  //   return (radius * 5) /150;
  // }

  let reserveBall = new Array(conf.ball_none_numbers).fill(null).map((coord) => ({
    life: conf.BALLLIFE,
    resting: true,
    target: true,
    weight: 1.2,
    coord: {
      x: getPosition(),
      y: 50,
      dx: 0,
      dy: 0
    },
    radius: conf.RADIUS,
    alpha: 1,
    color: '#ff0000',
    image: randomChoice(conf.IMAGE_BALL_ALL)
  }))
  
  // Création et ajout de six nouvelles balles à myArray
  const balls = new Array(conf.ball_numbers).fill(null).map((_) => ({
    life: conf.BALLLIFE,
    weight: 2,
    resting: true,
    coord: {
      x: randomInt(width),
      y: randomInt(height),
      dx: randomSign() * randomInt(10),
      dy: randomSign() * randomInt(10)
    },
    color: '#00ff00', // Couleur verte pour les nouvelles balles
    image: randomChoice(conf.IMAGE_BALL_ALL)

  }));

  let myArrayBriques = new Array(conf.brique_numbers).fill(null).map((_) => ({
    life : conf.BRIQUELIFE,
    weight : 50,
    coord: {
      x: randomInt(width),
      y: randomInt(height),
      dx: 0,
      dy: 0
    },
    width: 50,
    height: randomInt(100),
    color: '#0000ff', // Couleur bleue pour les briques
  }));

  // myArrayBriques = myArrayBriques.concat(new Array(conf.brique_numbers).fill(null).map((_) => ({
  //   life : conf.BRIQUELIFE,
  //   weight : 50,
  //   coord: {
  //     x: 0,
  //     y: height - 300,
  //     dx: 0,
  //     dy: 0
  //   },
  //   width: width,
  //   height: 50,
  //   color: '#0000ff', // Couleur bleue pour les briques
  // })));

  // Concaténation des nouvelles balles à l'array existant
  // myArrayBall = myArrayBall.concat(newBalls);

  // let target_ball = {
  //   life: conf.BALLLIFE,
  //   weight: 1.5,
  //   resting: true,
  //   target: true,
  //   coord: {
  //     x: conf.COORD_TARGET.x,
  //     y: conf.COORD_TARGET.y,
  //     dx: 0,
  //     dy: 0,
  //   },
  //   color: '#00ff00', // Couleur verte pour les nouvelles balles
  // };

  // balls.push(target_ball);


  const initialState: State = {
    target: null,
    pos: balls,
    briques: myArrayBriques,
    reserves: reserveBall,
    shoot: null,
    size: { height, width },
    endOfGame: true,
  }

  const ref = useRef<any>()
  const state = useRef<State>(initialState)

  const iterate = (ctx: CanvasRenderingContext2D) => {
    state.current = step(state.current)
    state.current.endOfGame = !endOfGame(state.current)
    render(ctx)(state.current)
    if (!state.current.endOfGame) requestAnimationFrame(() => iterate(ctx))
  }
  const onClick = (e: PointerEvent) => {
    // state.current = click(state.current)(e)
  }

  const ondrag = (e: PointerEvent) => {
    state.current = mousedown(state.current)(e)
  }

  const onMove = (e: PointerEvent) => {
    state.current = mouseMove(state.current)(e)
  }

  const onUp = (e: PointerEvent) => {
    state.current = mouseup(state.current)(e)
  }
  useEffect(() => {
    if (ref.current) {
      initCanvas(iterate)(ref.current)
      ref.current.addEventListener('click', onClick)
      ref.current.addEventListener('mousemove', onMove)
      ref.current.addEventListener('mousedown', ondrag)
      ref.current.addEventListener('mouseup', onUp)
    }
    return () => {
      ref.current.removeEventListener('click', onMove)
      ref.current.removeEventListener('mousemove', onMove)
      ref.current.removeEventListener('mousedown', ondrag)
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ref.current.removeEventListener('mouseup', onUp)
    }
  }, [])
  return <canvas {...{ height, width, ref }} />
}

export default Canvas
