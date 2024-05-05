import * as conf from './conf';
import { State, Coord, Point, getRotatedRectanglePoints, Brique } from './state';

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


const clear = (ctx: CanvasRenderingContext2D) => {
  const { height, width } = ctx.canvas;
  const backgroundImage = new Image();
  backgroundImage.src = conf.DEFAULT_BACKGROUND_IMAGE;
  backgroundImage.onload = () => ctx.drawImage(backgroundImage, 0, 0, width, height);
};

const drawCorner = (ctx: CanvasRenderingContext2D, corners: Array<Point>) => {
  // Draw a dot at each corner
  corners.forEach(corner => {
    ctx.beginPath();
    ctx.fillStyle = COLORS.RED;
    ctx.fillRect(corner.x, corner.y, 10, 10);
    ctx.fill();
  });
};

export const randomInt = (max: number) => Math.floor(Math.random() * max)
export const randomSign = () => Math.sign(Math.random() - 0.5) // cette random ren
const drawCircle = (
  ctx: CanvasRenderingContext2D,
  coord: Coord,
  link?: string,
  alpha: number = 1,
  radius: number = conf.RADIUS
) => {
  const rotationAngle = Math.atan2(coord.dy, coord.dx); // Calculate rotation angle based on velocity

  // For red balls (with images), load and draw the image.
  const backgroundImage = new Image();
  backgroundImage.src = link || conf.DEFAULT_BALL_BACKGROUND;

  // Ensure image is loaded before drawing
  backgroundImage.onload = () => {
    ctx.save(); // Save the current context state
    ctx.beginPath();
    ctx.globalAlpha = alpha; // Apply alpha only for this image

    ctx.translate(coord.x, coord.y);
    ctx.rotate(rotationAngle); // Apply rotation
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.clip();

    ctx.drawImage(backgroundImage, -radius, -radius, radius * 2, radius * 2);
    ctx.restore(); // Restore the context state, including globalAlpha
  }
};

const drawBrique = (
  ctx: CanvasRenderingContext2D,
  brique: Brique
) => {
  
  ctx.save(); // Save the current context state$
  
    const backgroundImage = new Image();
    backgroundImage.src =   brique.image

    // Ensure image is loaded before drawing
    backgroundImage.onload = () => {
      
      ctx.save(); // Save the current context state
      ctx.beginPath();

      ctx.translate(brique.coord.x + brique.width / 2, brique.coord.y + brique.height / 2); // Move the context to rectangle center
        const angle = brique.alpha * (Math.PI / 180);
        ctx.rotate(angle); // Rotate the context by alpha
      ctx.drawImage(backgroundImage, -brique.width / 2, -brique.height / 2, brique.width, brique.height); // Draw the image centered around the origin
      ctx.restore(); 
  }
  ctx.restore(); // Restore the original state
};

const drawShoot = (
  ctx: CanvasRenderingContext2D,
  shoot: Array<{ x: number; y: number }>
) => {
  shoot.forEach((p) => { 
    ctx.beginPath();
    ctx.fillStyle = 'blue';
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
    ctx.font = '48px "Comic Sans MS"';
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
  const logoImage = new Image();
  logoImage.src = conf.IMAGE_SLINGSHOT;
  logoImage.onload = () => {
  // Vous pouvez modifier x et y pour positionner le logo où vous le souhaitez sur le canevas.
  const x = conf.COORD_TARGET.x - 50
  const y = conf.COORD_TARGET.y
  ctx.drawImage(logoImage, x, y, 100, 100);
  };

  // Dessiner les balles
  state.pos.forEach(ball => {
    drawCircle(ctx, ball.coord, ball.image, ball.alpha, ball.radius);
  });

  // Dessiner les briques
  state.briques.forEach(brique => {
    drawBrique(ctx, brique);
    // drawCorner(ctx, getRotatedRectanglePoints(brique));
  });
  // Dessiner les balles de réserve
  state.reserves.forEach(reserve => {
    drawCircle(ctx, reserve.coord, reserve.image, reserve.alpha, reserve.radius);
  });

  // Dessiner les cochons
  state.pigs.forEach(pig => {
    drawCircle(ctx, pig.coord, conf.IMAGE_PIGS, pig.alpha, pig.radius);
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
      positionTire.x = conf.COORD_TARGET.x;
      positionTire.y = conf.COORD_TARGET.y;
      space_ball = 0;
      }
    if (target?.resting === true && target.selectect === true ) {

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
    }

  // Afficher le texte de fin si le jeu est terminé
  if (state.endOfGame) {
    var msg = "You Win";
    var image = conf.IMAGE_RED;
    if(state.pigs.length > 0 && state.pos.length <= 0){
       msg = "Game Over";
       image = conf.IMAGE_MINIONPIG;
    }
    drawEndGameScreen(ctx, image, msg);
  }
};
