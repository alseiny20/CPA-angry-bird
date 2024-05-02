import React from 'react';
import * as conf from '../canvas/conf';
type Props = {
  onPlayClick: () => void;
};

const HomePage: React.FC<Props> = ({ onPlayClick }) => {
  const logoImg = conf.LOGO_ANGRYBIRD;
  const playImg = "https://img.genial.ly/5ac916d1c1c1330fe7524802/05716208-4713-4ee2-a2d0-33e794446a07.png";//conf.PLAY_BUTTON;
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
  return (
    <div className="Homepage" style={backgroundStyle}>
      <div style={logoStyle}>
        <img className="logo" src={logoImg} alt="Logo" style={{ maxWidth: '500px'}} />
      </div>
      <div style={contentStyle}>
        <button onClick={onPlayClick} style={{ border: 'none', background: 'none' ,  }}>
          <img src={playImg} alt="Play Game" style={{ maxWidth: '200px' }}/>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
