import * as conf from './conf'
import { useRef, useEffect } from 'react'
import { State, step, click, mouseMove, endOfGame, mousedown, mouseup } from './state'
import { render } from './renderer'

const randomInt = (max: number) => Math.floor(Math.random() * max)
const randomSign = () => Math.sign(Math.random() - 0.5)

const initCanvas =
  (iterate: (ctx: CanvasRenderingContext2D) => void) =>
  (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    requestAnimationFrame(() => iterate(ctx))
  }
  

const Canvas = ({ height, width }: { height: number; width: number }) => {
  let myArray = new Array(1).fill(null).map((_) => ({
    life: conf.BALLLIFE,
    coord: {
      x: randomInt(width),
      y: randomInt(height),
      dx: randomSign() * Math.random() * 10,
      dy: randomSign() * Math.random() * 10,
    },
    color: '#ff0000',
  }))
  // Création et ajout de six nouvelles balles à myArray
  const newBalls = new Array(3).fill(null).map((_) => ({
    life: conf.BALLLIFE,
    coord: {
      x: randomInt(width),
      y: randomInt(height),
      dx: randomSign() * Math.random() * 10,
      dy: randomSign() * Math.random() * 10,
    },
    color: '#00ff00', // Couleur verte pour les nouvelles balles
  }));

  // Concaténation des nouvelles balles à l'array existant
  myArray = myArray.concat(newBalls);

  const initialState: State = {
    pos: myArray,
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
      ref.current.removeEventListener('mouseup', onUp)
    }
  }, [])
  return <canvas {...{ height, width, ref }} />
}

export default Canvas
