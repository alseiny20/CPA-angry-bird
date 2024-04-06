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
  backgroundImage.src = 'data:image/jpeg;base64,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';
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

  const drawBrique = (
    ctx: CanvasRenderingContext2D,
    { x, y }: { x: number; y: number },
    width: number,
    height: number,
    color: string
  ) => {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.rect(x, y, width, height);
    ctx.fill();
  }
  
  const computeBriqueColor = (life: number, baseColor: string) => {
    // Ajustez la couleur en fonction de la vie de la brique
    // const alpha = life / conf.BRIQUE_MAX_LIFE; // Ajustez en fonction de la vie max de vos briques
    // return rgbaTorgb(baseColor, 1 - alpha);
    return baseColor;
  }
  
  export const render = (ctx: CanvasRenderingContext2D) => (state: State) => {
    clear(ctx);
  
    // Dessiner les balles
    state.pos.forEach((c) => {
      drawCirle(ctx, c.coord, computeColor(c.life, conf.BALLLIFE, c.color || COLORS.RED), c.color || COLORS.RED);
    });
  
    // Dessiner les briques
    state.briques.forEach((b) => {
      drawBrique(ctx, b.coord, b.width, b.height, computeBriqueColor(b.life, b.color || COLORS.RED));
    });

    // Dessiner les balles 
  
    // Afficher le texte de fin si le jeu est terminé
    if (state.endOfGame) {
      const text = 'END';
      ctx.font = '48px arial';
      ctx.strokeText(text, state.size.width / 2 - ctx.measureText(text).width / 2, state.size.height / 2);
    }
  }
  

