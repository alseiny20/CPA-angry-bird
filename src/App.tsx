import React, { useState ,useRef, useEffect} from 'react'
import HomePage from './components/homepage/HomePage'
import Canvas from './components/canvas'

import './App.css'
import Menu from './components/menu/menupage'
export type Size = {
  height: number
  width: number
}
const App: React.FC = () => {
  const [showCanvas, setShowCanvas] = useState(false);

  const [size, setSize] = useState<Size | null>(null)
  const container = useRef<any>()
  
  
  useEffect(() => {
    setTimeout(() => {
      setSize({
        height: container.current.clientHeight,
        width: container.current.clientWidth,
      })
    }, 100)
  })
  const handlePlayClick = () => {
      // Add a delay of 500 milliseconds (adjust as needed)
    setTimeout(() => {
      setShowCanvas(true);
    }, 500);
  };

  return (
    <div className="App" ref={container}>
      {!showCanvas && <HomePage onPlayClick={handlePlayClick} />}
      {showCanvas && size && <Menu size={size}/>}
    </div>
  );
};

export default App;
