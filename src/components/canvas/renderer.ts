import * as conf from './conf';
import { State, Coord, Point, getRotatedRectanglePoints, Brick } from './state';

const COLORS = {
  RED: '#ff0000',
  GREEN: '#00ff00',
  BLUE: '#0000ff',
};

const clear = (ctx: CanvasRenderingContext2D) => {
  const { height, width } = ctx.canvas;
  const backgroundImage = new Image();
  backgroundImage.src = conf.DEFAULT_BACKGROUND_IMAGE;
  backgroundImage.onload = () => ctx.drawImage(backgroundImage, 0, 0, width, height);
};


const drawCircle = (
  ctx: CanvasRenderingContext2D,
  coord: Coord,
  link?: string,
  alpha: number = 1,
  radius: number = conf.RADIUS
) => {
  const rotationAngle = Math.atan2(coord.dy, coord.dx); // Calculate rotation angle based on velocity

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

const drawBrick = (
  ctx: CanvasRenderingContext2D,
  brick: Brick
) => {
  
  ctx.save(); // Save the current context state$
  
    const backgroundImage = new Image();
    backgroundImage.src =   brick.image

    // Ensure image is loaded before drawing
    backgroundImage.onload = () => {
      
      ctx.save(); // Save the current context state
      ctx.beginPath();

      ctx.translate(brick.coord.x + brick.width / 2, brick.coord.y + brick.height / 2); // Move the context to rectangle center
        const angle = brick.alpha * (Math.PI / 180);
        ctx.rotate(angle); // Rotate the context by alpha
      ctx.drawImage(backgroundImage, -brick.width / 2, -brick.height / 2, brick.width, brick.height); // Draw the image centered around the origin
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

  // Dessiner les oiseaux
  state.birds.forEach(bird => {
    drawCircle(ctx, bird.coord, bird.image, bird.alpha, bird.radius);
  });

  // Dessiner les bricks
  state.bricks.forEach(brick => {
    drawBrick(ctx, brick);
  });
  // Dessiner les oiseaux de réserve
  state.reserves.forEach(reserve => {
    drawCircle(ctx, reserve.coord, reserve.image, reserve.alpha, reserve.radius);
  });

  // Dessiner les cochons
  state.pigs.forEach(pig => {
    drawCircle(ctx, pig.coord, conf.IMAGE_PIGS, pig.alpha, pig.radius);
  });
  
    const target = state.birds.find((p) => p.target)
    const positionBird = target ? target.coord : { x: conf.COORD_TARGET.x, y: conf.COORD_TARGET.y, dx: 0, dy: 0 };
    var space_bird = 15;
    ctx.lineWidth = 5; // Set the thickness of the line
    ctx.strokeStyle = 'green'; // Set the color of the line
    var positionTire = { x: positionBird.x, y: positionBird.y };
    if ( (Math.abs(positionBird.x - conf.COORD_TARGET.x)< 30 && Math.abs(positionBird.y - conf.COORD_TARGET.y) < 30
    && target?.selectect === false )|| initPos) {
      initPos = true;
      positionTire.x = conf.COORD_TARGET.x;
      positionTire.y = conf.COORD_TARGET.y;
      space_bird = 0;
      }
    if (target?.resting === true && target.selectect === true ) {

      initPos = false;
    }
    // Draw the left side of the slingshot
    ctx.beginPath();
    ctx.moveTo(conf.COORD_TARGET.x - 40, conf.COORD_TARGET.y + 5); // Start point
    ctx.lineTo(positionTire.x - space_bird, positionTire.y + 10); // End point at the slingshot pouch
    ctx.stroke(); // Draw the path

    // Draw the right side of the slingshot
    ctx.beginPath();
    ctx.moveTo(conf.COORD_TARGET.x + 40, conf.COORD_TARGET.y + 10); // Start point
    ctx.lineTo(positionTire.x + space_bird, positionTire.y + 10); // End point at the slingshot pouch
    ctx.stroke(); // Draw the path

    if(state.target && state.shoot){
      drawShoot(ctx, state.shoot);
    }
};
