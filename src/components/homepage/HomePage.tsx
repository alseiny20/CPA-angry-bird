import React from 'react';
import * as conf from '../canvas/conf';
import './homepage.css';

type Props = {
  onPlayClick: () => void;
};

const HomePage: React.FC<Props> = ({ onPlayClick }) => {

  const logoImg = conf.LOGO_ANGRYBIRD;
  const playImg = conf.PLAY_BUTTON;
  const backgroundImg = conf.HOMEPAGE_BACKGROUND;
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
  const logoStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    paddingBottom: '10%',
    alignSelf: 'center', 
    padding: '100px 0',
  };
  const contentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    paddingTop: '5%',
  };

  const handleButtonClick = () => {
    onPlayClick();
    const button = document.querySelector('.button');
    if (button) {
      button.classList.add('button-clicked'); // Trigger animation
      setTimeout(() => {
        button.classList.remove('button-clicked'); // Reset animation after duration
      }, 300); // Same duration as transition in CSS
    }
  };
  return (
    <div className="Homepage" style={backgroundStyle}>
      <div style={logoStyle}>
        <img className="logo" src={logoImg} alt="Logo" style={{ maxWidth: '500px'}} />
      </div>
      <div style={contentStyle}>
        <button className="button" onClick={handleButtonClick} style={{ border: 'none', background: 'none' ,  }}>
          <img src={playImg} alt="Play Game" style={{ maxWidth: '200px' }}/>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
