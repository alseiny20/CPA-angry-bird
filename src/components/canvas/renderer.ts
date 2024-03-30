import * as conf from './conf'
import { State } from './state'
const COLORS = {
  RED: '#ff0000',
  GREEN: '#00ff00',
  BLUE: '#0000ff',
}

const toDoubleHexa = (n: number) =>
  n < 16 ? '0' + n.toString(16) : n.toString(16)

export const rgbaTorgb = (rgb: string, alpha = 0) => {
  let r = 0
  let g = 0
  let b = 0
  if (rgb.startsWith('#')) {
    const hexR = rgb.length === 7 ? rgb.slice(1, 3) : rgb[1]
    const hexG = rgb.length === 7 ? rgb.slice(3, 5) : rgb[2]
    const hexB = rgb.length === 7 ? rgb.slice(5, 7) : rgb[3]
    r = parseInt(hexR, 16)
    g = parseInt(hexG, 16)
    b = parseInt(hexB, 16)
  }
  if (rgb.startsWith('rgb')) {
    const val = rgb.replace(/(rgb)|\(|\)| /g, '')
    const splitted = val.split(',')
    r = parseInt(splitted[0])
    g = parseInt(splitted[1])
    b = parseInt(splitted[2])
  }

  r = Math.max(Math.min(Math.floor((1 - alpha) * r + alpha * 255), 255), 0)
  g = Math.max(Math.min(Math.floor((1 - alpha) * g + alpha * 255), 255), 0)
  b = Math.max(Math.min(Math.floor((1 - alpha) * b + alpha * 255), 255), 0)
  return `#${toDoubleHexa(r)}${toDoubleHexa(g)}${toDoubleHexa(b)}`
}

const clear = (ctx: CanvasRenderingContext2D) => {
  const { height, width } = ctx.canvas
  const backgroundImage = new Image();
  backgroundImage.src = 'https://www.w3schools.com/html/pic_trulli.jpg';
  backgroundImage.onload = () => {
    ctx.drawImage(backgroundImage, 0, 0, width, height);
  };
}

const drawCirle = (
  ctx: CanvasRenderingContext2D,
  { x, y }: { x: number; y: number },
  color: string,
  initColor: string
) => {
  if(initColor != COLORS.RED){
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.arc(x, y, conf.RADIUS, 0, 2 * Math.PI)
    ctx.fill()
 }else{
  const backgroundImage = new Image();
  backgroundImage.src = 'https://www.allbranded.fr/out/shop-fr/pictures/generated/product/1/480_480_80/mo9007-33.jpg';

  // Définit la zone de dessin restreinte à l'intérieur du cercle
  ctx.save(); 
  ctx.beginPath();
  ctx.arc(x, y, conf.RADIUS, 0, 2 * Math.PI);
  ctx.clip(); 

  // Dessine l'image à l'intérieur du cercle restreint
  const offsetX = x - conf.RADIUS;
  const offsetY = y - conf.RADIUS;
  ctx.drawImage(backgroundImage, offsetX, offsetY, conf.RADIUS * 2, conf.RADIUS * 2);

  // Restaure le contexte précédent pour annuler le clipping
  ctx.restore();
 }
}

const computeColor = (life: number, maxLife: number, baseColor: string) =>
  rgbaTorgb(baseColor, (maxLife - life) * (1 / maxLife))

export const render = (ctx: CanvasRenderingContext2D) => (state: State) => {
  clear(ctx)

  state.pos.map((c) =>
    drawCirle(ctx, c.coord, computeColor(c.life, conf.BALLLIFE, c.color || COLORS.RED), c.color || COLORS.RED)
  )

  if (state.endOfGame) {
    const text = 'END'
    ctx.font = '48px arial'
    ctx.strokeText(text, state.size.width / 2 - 200, state.size.height / 2)
  }
}
