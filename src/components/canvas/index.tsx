import * as conf from './conf'
import { useRef, useEffect, useState } from 'react'
import { State, step, mouseMove, mousedown, mouseup,Pig, Brique} from './state'
import { render } from './renderer'
import * as json from '../../data.json';

import EndGamePage from '../endgame/endgame';
export const randomInt = (max: number) => Math.floor(Math.random() * max)
export const randomSign = () => Math.sign(Math.random() - 0.5) // cette random ren

// Chargez le fichier JSON
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
  var level = config.levels.find((lvl: { id: number }) => lvl.id === levelId);
  if (!level) {
    level = config.levels.find((lvl: { id: number }) => lvl.id === 1);
  }

  const pigs: Pig[] = level.pigs.map((pigConfig: { life: any; resting: any; target: any; weight: any; coord: any; radius: any; alpha: any; color: any; }) => ({
    life: pigConfig.life,
    resting: pigConfig.resting,
    target: pigConfig.target,
    weight: pigConfig.weight,
    coord: pigConfig.coord,
    radius: pigConfig.radius,
    alpha: pigConfig.alpha,
    color: pigConfig.color,
  }));

  const briques: Brique[] = level.bricks.map((brickConfig: { life: any; weight: any; coord: any; width: any; height: any ;image:string}) => ({
    life: brickConfig.life,
    weight: brickConfig.weight,
    coord: brickConfig.coord,
    width: brickConfig.width,
    height: brickConfig.height,
    image : conf.BLOCK,
    rotationAngle : 0,
    angularVelocity : 0,
    center : {x: brickConfig.coord.x + brickConfig.width / 2, y: brickConfig.coord.y + brickConfig.height / 2},
    alpha : 0,
    dr : 0,
  }));

  return { pigs, briques };
}
const Canvas = ({ height, width,level }: { height: number; width: number, level:number }) => {
 
  // intialisation des balles
  let position = 20;
  const getPosition = () => {
    position = position + 60;
    return position;
  }
  
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
  

  let { pigs, briques }  = createEntities(level);

  const canvasHeight = height - 100;
  const initialState: State = {
    pos: [],
    pigs: pigs,
    briques: briques,
    target: null,
    reserves: reserveBall,
    shoot: null,
    size: { height : canvasHeight, width },
    endOfGame: false,
    win: false,
  }

  const ref = useRef<any>()
  const state = useRef<State>(initialState)
  const [isGameEnded, setGameEnded] = useState(false);

  const iterate = (ctx: CanvasRenderingContext2D) => {
    state.current = step(state.current)
    // state.current.endOfGame = !endOfGame(state.current)
    render(ctx)(state.current)

    
    if (!state.current.endOfGame) requestAnimationFrame(() => iterate(ctx))
    else {
      setGameEnded(true);
    }
  }
  const onClick = (e: PointerEvent) => {
    // state.current = click(state.current)(e)
    console.log('click', e.clientX, e.clientY)
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
  const backgroundImg = conf.DEFAULT_BACKGROUND_IMAGE;
  const backgroundStyle: React.CSSProperties = {
    backgroundImage: `url(${backgroundImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  };
  if (isGameEnded) {
    return <EndGamePage win={state.current.win} level={level} size={{height:height , width:width}}/>;
  }
  return(
    <div style={backgroundStyle}>
      <canvas {...{ height, width, ref }} />
    </div>
  ) 
}

export default Canvas
