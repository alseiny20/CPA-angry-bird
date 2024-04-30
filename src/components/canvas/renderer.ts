import * as conf from './conf';
import { State, Coord } from './state';

const COLORS = {
  RED: '#ff0000',
  GREEN: '#00ff00',
  BLUE: '#0000ff',
};

const toDoubleHexa = (n: number) => (n < 16 ? '0' + n.toString(16) : n.toString(16));

export const rgbaTorgb = (rgb: string, alpha = 0) => {
  let r = 0, g = 0, b = 0;

  if (rgb.startsWith('#')) {
    const [hexR, hexG, hexB] = rgb.length === 7 ? [rgb.slice(1, 3), rgb.slice(3, 5), rgb.slice(5, 7)] : [rgb[1], rgb[2], rgb[3]];
    [r, g, b] = [parseInt(hexR, 16), parseInt(hexG, 16), parseInt(hexB, 16)];
  } else if (rgb.startsWith('rgb')) {
    const [rStr, gStr, bStr] = rgb.replace(/(rgb)|\(|\)| /g, '').split(',');
    [r, g, b] = [parseInt(rStr), parseInt(gStr), parseInt(bStr)];
  }

  [r, g, b] = [r, g, b].map(channel => Math.max(Math.min(Math.floor((1 - alpha) * channel + alpha * 255), 255), 0));
  return `#${toDoubleHexa(r)}${toDoubleHexa(g)}${toDoubleHexa(b)}`;
};

const clear = (ctx: CanvasRenderingContext2D) => {
  const { height, width } = ctx.canvas;
  const backgroundImage = new Image();
  backgroundImage.src = conf.DEFAULT_BACKGROUND_IMAGE;
  console.log('backgroundImage.src', backgroundImage.src);
  backgroundImage.onload = () => ctx.drawImage(backgroundImage, 0, 0, width, height);
};

export const randomInt = (max: number) => Math.floor(Math.random() * max)
export const randomSign = () => Math.sign(Math.random() - 0.5) // cette random ren

const drawCircle = (
  ctx: CanvasRenderingContext2D,
  { x, y }: { x: number; y: number },
  color: string,
  initColor: string,
  link?: string,
  alpha: number = 1,
  radius: number = conf.RADIUS
) => {
  if (initColor !== COLORS.RED) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
  } else {
    const backgroundImage = new Image();
    backgroundImage.src = link || conf.DEFAULT_BALL_BACKGROUND;
    backgroundImage.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.globalAlpha = alpha;
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.clip();
      ctx.drawImage(backgroundImage, x - conf.RADIUS, y - conf.RADIUS, conf.RADIUS * 2, conf.RADIUS * 2);
      ctx.restore();
    };
  }
};

const computeColor = (life: number, maxLife: number, baseColor: string) => {
  return rgbaTorgb(baseColor, (maxLife - life) * (1 / maxLife));
};

// const drawBrique = (
//   ctx: CanvasRenderingContext2D,
//   { x, y }: { x: number; y: number },
//   width: number,
//   height: number,
//   color: string
// ) => {
//   ctx.beginPath();
//   ctx.fillStyle = color;
//   ctx.rect(x, y, width, height);
//   ctx.fill();
// };
const drawBrique = (
    ctx: CanvasRenderingContext2D,
    { x, y }: { x: number; y: number },
    width: number,
    height: number,
    color: string,
    initColor: string,
    imageLink?: string // Path to the brick image
  ) => {
    if (initColor !== COLORS.RED) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.rect(x, y, width, height);
        ctx.fill();
    } else {
      const brickImage = new Image();
      brickImage.src = imageLink || './brick.png' || "https://www.angrybirds.com/wp-content/uploads/2022/08/AB2_202211_500x500_Website_Red.png	";

      // Wait for the image to load
      brickImage.onload = () => {
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.drawImage(brickImage, x, y, width, height);
        ctx.restore();
      };
    }
};

const drawShoot = (
  ctx: CanvasRenderingContext2D,
  shoot: Array<{ x: number; y: number }>
) => {
  shoot.forEach((p) => { 
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}


var initPos = false;
export const render = (ctx: CanvasRenderingContext2D) => (state: State) => {
  clear(ctx);

  // Dessiner la lance
  const slingshot = new Image();
  slingshot.src = 'https://www.clipartmax.com/png/full/110-1101727_sling-shot-image-angry-birds-slingshot-clipart.png';
  slingshot.onload = () => {
  const x = conf.COORD_TARGET.x - 50
  const y = conf.COORD_TARGET.y
  ctx.drawImage(slingshot, x, y,80,  170);
  };

  // Dessiner les balles
  state.pos.forEach(ball => {
    drawCircle(ctx, ball.coord, computeColor(ball.life, conf.BALLLIFE, ball.color || COLORS.RED), ball.color || COLORS.RED, ball.image, ball.alpha, ball.radius);
  });

  // Dessiner les briques
  state.briques.forEach(brique => {
    drawBrique(ctx, brique.coord, brique.width, brique.height, computeColor(brique.life, conf.BRIQUELIFE, brique.color || COLORS.BLUE), brique.color || COLORS.GREEN, brique.image);
  });

  // Dessiner les balles de réserve
  state.reserves.forEach(reserve => {
    drawCircle(ctx, reserve.coord, computeColor(reserve.life, conf.BALLLIFE, reserve.color || COLORS.GREEN), reserve.color || COLORS.GREEN, reserve.image, reserve.alpha, reserve.radius);
  });

  // Dessiner les cochons
  state.pigs.forEach(pig => {
    drawCircle(ctx, pig.coord, computeColor(pig.life, conf.PIGLIFE, pig.color || COLORS.GREEN), pig.color || COLORS.RED, pig.image, pig.alpha, pig.radius);
  });
  

    const target = state.pos.find((p) => p.target)
    const positionBall = target ? target.coord : { x: conf.COORD_TARGET.x, y: conf.COORD_TARGET.y, dx: 0, dy: 0 };
    var space_ball = 15;
    ctx.lineWidth = 5; // Set the thickness of the line
    ctx.strokeStyle = 'green'; // Set the color of the line
    var positionTire = { x: positionBall.x, y: positionBall.y };
    if ( (Math.abs(positionBall.x - conf.COORD_TARGET.x)< 30 && Math.abs(positionBall.y - conf.COORD_TARGET.y) < 30
    && target?.selectect === false )|| initPos) {
      initPos = true;
      console.log("******************************");
      positionTire.x = conf.COORD_TARGET.x;
      positionTire.y = conf.COORD_TARGET.y;
      space_ball = 0;
      }
    if (target?.resting === true && target.selectect === true ) {
      console.log("**>>>>>>>");

      initPos = false;
    }
    // Draw the left side of the slingshot
    ctx.beginPath();
    ctx.moveTo(conf.COORD_TARGET.x - 40, conf.COORD_TARGET.y + 5); // Start point
    ctx.lineTo(positionTire.x - space_ball, positionTire.y + 10); // End point at the slingshot pouch
    ctx.stroke(); // Draw the path

    // Draw the right side of the slingshot
    ctx.beginPath();
    ctx.moveTo(conf.COORD_TARGET.x + 40, conf.COORD_TARGET.y + 10); // Start point
    ctx.lineTo(positionTire.x + space_ball, positionTire.y + 10); // End point at the slingshot pouch
    ctx.stroke(); // Draw the path

    if(state.target && state.shoot){
      drawShoot(ctx, state.shoot);
      console.log("shooting", state.shoot);
    }

    // console.log("**<>",target?.selectect);
    // console.log("**<>",positionTire.x,conf.COORD_TARGET.x,positionTire.y,conf.COORD_TARGET.y);
    
    // // Draw the half-circle for the slingshot pouch
    // ctx.beginPath();
    // ctx.arc(positionTire.x,
    //   positionTire.y,
    //   target?.radius || conf.RADIUS / 2, 
    //   Math.PI, 0, 
    //   (target !== undefined && target.coord.dy>0));
    // ctx.stroke(); // Draw the path 

  
  // Afficher le texte de fin si le jeu est terminé
  if (state.endOfGame) {
    const text = 'END';
    ctx.font = '48px arial';
    ctx.strokeText(text, state.size.width / 2 - ctx.measureText(text).width / 2, state.size.height / 2);
  }
};
