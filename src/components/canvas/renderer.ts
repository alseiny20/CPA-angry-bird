import * as conf from './conf';
import { State, Coord, Brique } from './state';

const COLORS = {
  RED: '#ff0000',
  GREEN: '#00ff00',
  BLUE: '#0000ff',
};

const toDoubleHexa = (n: number) => (n < 16 ? '0' + n.toString(16) : n.toString(16));
export const rgbaTorgb = (rgb: string, alpha = 1) => {
  let r = 0, g = 0, b = 0;

  if (rgb.startsWith('#')) {
    const [hexR, hexG, hexB] = rgb.length === 7 ? [rgb.slice(1, 3), rgb.slice(3, 5), rgb.slice(5, 7)] : [rgb[1], rgb[2], rgb[3]];
    [r, g, b] = [parseInt(hexR, 16), parseInt(hexG, 16), parseInt(hexB, 16)];
  } else if (rgb.startsWith('rgb')) {
    const [rStr, gStr, bStr] = rgb.replace(/(rgb)|\(|\)| /g, '').split(',');
    [r, g, b] = [parseInt(rStr), parseInt(gStr), parseInt(bStr)];
  }

  // No alpha blending here, just return the hex color
  return `#${toDoubleHexa(r)}${toDoubleHexa(g)}${toDoubleHexa(b)}`;
};
// export const rgbaTorgb = (rgb: string, alpha = 0) => {
//   let r = 0, g = 0, b = 0;

//   if (rgb.startsWith('#')) {
//     const [hexR, hexG, hexB] = rgb.length === 7 ? [rgb.slice(1, 3), rgb.slice(3, 5), rgb.slice(5, 7)] : [rgb[1], rgb[2], rgb[3]];
//     [r, g, b] = [parseInt(hexR, 16), parseInt(hexG, 16), parseInt(hexB, 16)];
//   } else if (rgb.startsWith('rgb')) {
//     const [rStr, gStr, bStr] = rgb.replace(/(rgb)|\(|\)| /g, '').split(',');
//     [r, g, b] = [parseInt(rStr), parseInt(gStr), parseInt(bStr)];
//   }

//   [r, g, b] = [r, g, b].map(channel => Math.max(Math.min(Math.floor((1 - alpha) * channel + alpha * 255), 255), 0));
//   return `#${toDoubleHexa(r)}${toDoubleHexa(g)}${toDoubleHexa(b)}`;
// };

const clear = (ctx: CanvasRenderingContext2D) => {
  const { height, width } = ctx.canvas;
  const backgroundImage = new Image();
  backgroundImage.src = conf.DEFAULT_BACKGROUND_IMAGE;
  console.log('backgroundImage.src', backgroundImage.src);
  backgroundImage.onload = () => ctx.drawImage(backgroundImage, 0, 0, width, height);
  
  // const { width, height } = ctx.canvas;
  // // Clear the canvas with a transparent fill
  // ctx.clearRect(0, 0, width, height);
};

export const randomInt = (max: number) => Math.floor(Math.random() * max)
export const randomSign = () => Math.sign(Math.random() - 0.5) // cette random ren
const drawCircle = (
  ctx: CanvasRenderingContext2D,
  coord: Coord,
  color: string,
  initColor: string,
  link?: string,
  alpha: number = 1,
  radius: number = conf.RADIUS
) => {
  const rotationAngle = Math.atan2(coord.dy, coord.dx); // Calculate rotation angle based on velocity

  if (initColor !== COLORS.RED) {
    // For non-red balls, draw normally.
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(coord.x, coord.y, radius, 0, 2 * Math.PI);
    ctx.fill();
  } else {
    // For red balls (with images), load and draw the image.
    const backgroundImage = new Image();
    backgroundImage.src = link || conf.DEFAULT_BALL_BACKGROUND;

    // Ensure image is loaded before drawing
    backgroundImage.onload = () => {
      ctx.save(); // Save the current context state
      ctx.globalAlpha = alpha; // Apply alpha only for this image

      ctx.beginPath();
      ctx.translate(coord.x, coord.y);
      ctx.rotate(rotationAngle); // Apply rotation
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.clip();

      ctx.drawImage(backgroundImage, -radius, -radius, radius * 2, radius * 2);
      ctx.restore(); // Restore the context state, including globalAlpha
    };
  }
};

// const drawCircle = (
//   ctx: CanvasRenderingContext2D,
//   coord: Coord,
//   color: string,
//   initColor: string,
//   link?: string,
//   alpha: number = 1,
//   radius: number = conf.RADIUS
// ) => {
//   const rotationAngle = Math.atan2(coord.dy, coord.dx); // Calculate rotation angle based on velocity

//   ctx.globalAlpha = alpha; // Set global alpha based on input
//   if (initColor !== COLORS.RED) {
//     ctx.beginPath();
//     ctx.fillStyle = color;
//     ctx.arc(coord.x, coord.y, radius, 0, 2 * Math.PI);
//     ctx.fill();
//   } else {
//     const backgroundImage = new Image();
//     backgroundImage.src = link || conf.DEFAULT_BALL_BACKGROUND;
//     backgroundImage.onload = () => {
//       ctx.save();
//       ctx.beginPath();
//       ctx.globalAlpha = alpha;
//       ctx.translate(coord.x, coord.y);
//       ctx.rotate(rotationAngle); // Apply rotation
//       ctx.arc(0, 0, radius, 0, 2 * Math.PI);
//       ctx.clip();
//       ctx.drawImage(backgroundImage, -radius, -radius, radius * 2, radius * 2);
//       ctx.restore();
//     };
//   }
  
// };
// const drawCircle = (
//   ctx: CanvasRenderingContext2D,
//   { x, y }: { x: number; y: number },
//   color: string,
//   initColor: string,
//   link?: string,
//   alpha: number = 1,
//   radius: number = conf.RADIUS
// ) => {
//   if (initColor !== COLORS.RED) {
//     ctx.beginPath();
//     ctx.fillStyle = color;
//     ctx.arc(x, y, radius, 0, 2 * Math.PI);
//     ctx.fill();
//   } else {
//     const backgroundImage = new Image();
//     backgroundImage.src = link || conf.DEFAULT_BALL_BACKGROUND;
//     backgroundImage.onload = () => {
//       ctx.save();
//       ctx.beginPath();
//       ctx.globalAlpha = alpha;
//       ctx.arc(x, y, radius, 0, 2 * Math.PI);
//       ctx.clip();
//       ctx.drawImage(backgroundImage, x - conf.RADIUS, y - conf.RADIUS, conf.RADIUS * 2, conf.RADIUS * 2);
//       ctx.restore();
//     };
//   }
// };

const computeColor = (life: number, maxLife: number, baseColor: string) => {
  return rgbaTorgb(baseColor, (maxLife - life) * (1 / maxLife));
};

// const drawBrique = (
//   ctx: CanvasRenderingContext2D,
//   brick: Brique,
//   coord: Coord,
//   width: number,
//   height: number,
//   color: string,
//   initColor: string,
//   imageLink?: string // Path to the brick image
// ) => {
//   const rotationAngle = Math.atan2(coord.dy, coord.dx); // Calculate rotation angle based on velocity

//   if (initColor !== COLORS.RED) {
//     ctx.beginPath();
//     ctx.fillStyle = color;
//     ctx.rect(coord.x, coord.y, width, height);
//     ctx.fill();
//   } else {
//     const brickImage = new Image();
//     brickImage.src = imageLink || conf.BLOCK;

//     // Wait for the image to load
//     brickImage.onload = () => {
//       ctx.save();
//       ctx.translate(coord.x + width / 2, coord.y + height / 2);
//       ctx.rotate(brick.rotationAngle); // Apply rotation
//       ctx.drawImage(brickImage, -width / 2, -height / 2, width, height);
//       ctx.restore();
//     };
//   }
// };
// const drawBrique = (
//     ctx: CanvasRenderingContext2D,
//     brick: Brique,
//     coord: Coord,
//     width: number,
//     height: number,
//     color: string,
//     initColor: string,
//     imageLink?: string // Path to the brick image
// ) => {
//   ctx.beginPath();
//   ctx.fillStyle = color;
//   ctx.rect(coord.x, coord.y, width, height);
//   ctx.fill();
// };
const drawBrique = (
  ctx: CanvasRenderingContext2D,
    brick: Brique,
    coord: Coord,
    width: number,
    height: number,
    color: string,
    initColor: string,
    imageLink?: string // Path to the brick image
) => {
  ctx.save(); // Save the current drawing state
  ctx.fillStyle = color;

  // Translate to the center of the brick
  ctx.translate(brick.coord.x + brick.width / 2, brick.coord.y + brick.height / 2);

  // Rotate the context based on brick's rotation angle
  ctx.rotate(brick.rotationAngle);

  // Draw the rotated rectangle
  ctx.fillRect(-brick.width / 2, -brick.height / 2, brick.width, brick.height);

  ctx.restore(); // Restore the previous drawing state
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
const drawEndGameScreen = (ctx : CanvasRenderingContext2D, image:string, msg:string) => {
  const { height, width } = ctx.canvas;

  // Load the background image
  const backgroundImage = new Image();
  backgroundImage.src = conf.END_GAME_BACKGROUND;
  backgroundImage.onload = () => {
    ctx.drawImage(backgroundImage, 0, 0, width, height);

    // Draw text on top of the image
    const text = msg;
    ctx.font = '48px Arial';
    ctx.fillStyle = 'white'; // Text color
    ctx.textAlign = 'center'; // Center the text horizontally
    ctx.textBaseline = 'middle'; // Center the text vertically
    const textYOffset = height / 2 - 50; // Offset the text vertically
    ctx.fillText(text, width / 2, textYOffset); // Fill text adjusted above center

    // Load the image to be drawn on top
    const endImage = new Image();
    endImage.src = image;
    endImage.onload = () => {
      // Draw the end image on top of the background image
      const imageYOffset = height / 2 + 50; // Offset the end image vertically
      ctx.drawImage(endImage, width / 2 - endImage.width / 2, imageYOffset);
    };
  };
};

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
    drawBrique(ctx, brique, brique.coord, brique.width, brique.height, computeColor(brique.life, conf.BRIQUELIFE, brique.color || COLORS.BLUE), brique.color || COLORS.GREEN, brique.image);
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

  
  // Afficher le texte de fin si le jeu est terminé
  if (state.endOfGame) {
    msg = "You Win";
    image = conf.IMAGE_RED;
    if(state.pigs.length > 0 && state.pos.length <= 0){
      var msg = "Game Over";
      var image = conf.IMAGE_MINIONPIG;
    }

    drawEndGameScreen(ctx, image, msg);
  }
};
