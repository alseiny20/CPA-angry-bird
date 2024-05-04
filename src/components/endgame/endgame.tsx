import React, { useState } from 'react';
import * as conf from '../canvas/conf';
import '../homepage/homepage.css';
import Canvas from '../canvas';
import reloadImg from '../../imgs/reload.png';
import nextImg from '../../imgs/next.png';

interface EndGameProps {
  win: boolean; // Pass your game state here
  level: number;
  size: {height:number, width:number}
}


  const backgroundImg = conf.END_GAME_BACKGROUND;
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
const EndGameScreen: React.FC<EndGameProps> = ({ win,level,size }) => {
    // const reloadImg = reloadImg; // Path to the reload image
  const [next, setNext] = useState(false);
  const [nextLevel, setLevel] = useState(level);

    const endImg = win ? conf.IMAGE_RED : conf.IMAGE_KINGPIG;

  const handleButtonClick = (action: 'reload' | 'next', e: React.MouseEvent<HTMLButtonElement>) => {
    const clickedButton = e.currentTarget;
  clickedButton.classList.add('button-clicked'); // Apply animation to clicked button

    setTimeout(() => {
        if (action === 'next') {
            setLevel(level + 1);
        } else {
            setLevel(level);
        }
    
        setNext(true);
    }, 500);
  };

  if(next){
    return <Canvas height={size.height} width={size.width} level={nextLevel} />
  }
  // Your end game rendering logic here
  return (
    <div className="end-game-container" style={backgroundStyle}>
      <h1>{win ? 'You Win!' : 'Game Over'}</h1>
      {/* Add more end game information or images here */}
      <img src={endImg} alt="Play Game" style={{ maxWidth: '200px' }}/>
      <div className="button">
        <button onClick={(e) => handleButtonClick('reload',e)}style={{ border: 'none', background: 'none' ,  padding : '20px'}}>
            <img src={reloadImg} alt="Play Game" style={{ width: '90px' }}/>
            </button>
        <button onClick={(e) => handleButtonClick('next',e)}style={{ border: 'none', background: 'none' ,  padding : '20px' }}>
            <img src={nextImg} alt="Play Game" style={{ width: '90px',transform: 'rotate(180deg)' }}/>
        </button>
      </div>
    </div>
  );
};

export default EndGameScreen;

