import * as conf from './conf'
import { useRef, useEffect } from 'react'
import { State, step, click, mouseMove, endOfGame, mousedown, mouseup,Pig, Brique} from './state'
import { render } from './renderer'
// import * as fs from 'fs';
import * as json from '../../data.json';
export const randomInt = (max: number) => Math.floor(Math.random() * max)
export const randomSign = () => Math.sign(Math.random() - 0.5) // cette random ren

// Chargez le fichier JSON
// const filePath = './data.json';
// const jsonFile = fs.readFileSync(filePath);
const jsonFileString = JSON.stringify(json);
const config = JSON.parse(jsonFileString);

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

// Fonction pour créer les cochons et les briques en fonction du niveau donné
function createEntities(levelId: number) {
  const level = config.levels.find((lvl: { id: number }) => lvl.id === levelId);
  if (!level) {
    console.error(`Level ${levelId} not found in the configuration.`);
    return { pigs: [], briques: [] };
  }

  const pigs: Pig[] = level.pigs.map((pigConfig: { life: any; resting: any; target: any; weight: any; coord: any; radius: any; alpha: any; color: any; image: any }) => ({
    life: pigConfig.life,
    resting: pigConfig.resting,
    target: pigConfig.target,
    weight: pigConfig.weight,
    coord: pigConfig.coord,
    radius: pigConfig.radius,
    alpha: pigConfig.alpha,
    color: pigConfig.color,
    image: pigConfig.image,
  }));

  const briques: Brique[] = level.bricks.map((brickConfig: { life: any; weight: any; coord: any; width: any; height: any; color: any ;image:string, alpha : number, dr: number}) => ({
    life: brickConfig.life,
    weight: brickConfig.weight,
    coord: brickConfig.coord,
    width: brickConfig.width,
    height: brickConfig.height,
    color: brickConfig.color,
    image : brickConfig.image,
    alpha : brickConfig.alpha,
    dr : brickConfig.dr

  }));

  return { pigs, briques };
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
    image: randomChoice(conf.IMAGE_BALL_ALL),
    radius : conf.RADIUS
  }));

  let { pigs, briques }  = createEntities(3);
  // const pigs = new Array(conf.pig_numbers).fill(null).map((_) => ({
  //   life: conf.PIGLIFE,
  //   resting: true,
  //   target: true,
  //   weight: 1.2,
  //   coord: {
  //     x: 400,
  //     y: 700,
  //     dx: 0,
  //     dy: 0
  //   },
  //   radius: conf.RADIUS,
  //   alpha: 1,
  //   color: '#ff0000',
  //   image: conf.IMAGE_KINGPIG

  // }));

  let myArrayBriques = new Array(conf.brique_numbers).fill(null).map((_) => ({
    life : conf.BRIQUELIFE,
    weight : 50,
    coord: {
      x: 500,//randomInt(width),
      y: 500,//randomInt(height),
      dx: 0,
      dy: 0
    },
    width: 100,
    height: 100,//randomInt(100),
    color: '#000000', // Couleur bleue pour les briques
  })).concat(new Array(conf.brique_numbers).fill(null).map((_) => ({
  
      life : conf.BRIQUELIFE,
      weight : 50,
      coord: {
        x: 500,//randomInt(width),
        y: 300,//randomInt(height),
        dx: 0,
        dy: 0
      },
      width: 100,
      height: 100,//randomInt(100),
      color: '#0000ff', // Couleur bleue pour les briques
    })));

  const initialState: State = {
    pos: balls,
    pigs: pigs,
    briques: briques,
    target: null,
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
