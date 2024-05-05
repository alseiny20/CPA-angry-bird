import React, { useState } from 'react';
import * as conf from '../canvas/conf';
import Canvas from '../canvas';


interface MenuProps {
  size: {height:number, width:number}
}


  const backgroundImg = conf.MENU_BACKGROUND;
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
  const levelBox: React.CSSProperties = {
    display: 'inline-block',
    padding: '20px',
    border: '5px solid #D9D75E', // White border
    borderRadius: '10px', // Rounded corners
    fontSize: '50px', // Bigger font size
    cursor: 'pointer', // Cursor indicates clickable item
    margin: '30px', // Space between buttons
    minWidth: '100px', // Minimum width
    minHeight: '50px', // Minimum height
    backgroundColor: '#99D0FE', // Light yellow background
    color: '#D9D75E', // White font color
  
    textShadow:
      '-1px -1px 0 #000, ' +
      '1px -1px 0 #000, ' +
      '-1px 1px 0 #000, ' +
      '1px 1px 0 #000', // Create a border effect using text-shadow
    boxShadow: 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px', // Box shadow
  };
  
  

const Menu: React.FC<MenuProps> = ({ size }) => {
  const [level, setLevel] = useState(1);
    const [next, setNext] = useState(false);

  const handleButtonClick = (choice: number, e: React.MouseEvent<HTMLButtonElement>) => {
    const clickedButton = e.currentTarget;
  clickedButton.classList.add('button-clicked'); // Apply animation to clicked button

    setTimeout(() => {
        setLevel(choice);
        setNext(true);
    }, 500);
  };

  if(next){
    return <Canvas height={size.height} width={size.width} level={level} />
  }
  // Your end game rendering logic here
  return (
    
    <div className="menu" style={backgroundStyle}>
      <h1 style={{fontSize: '50px'}}>Select Level </h1>
      <div className="button">
        <button onClick={(e) => handleButtonClick(1,e)}style={levelBox} > 1 </button>
        <button onClick={(e) => handleButtonClick(2,e)}style={levelBox} > 2 </button>
        <button onClick={(e) => handleButtonClick(3,e)}style={levelBox} > 3 </button>
        <button onClick={(e) => handleButtonClick(4,e)}style={levelBox} > 4 </button>
      </div>
    </div>
  );
};

export default Menu;

