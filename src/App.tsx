// import { useRef, useEffect, useState } from 'react'
// import Loader from './components/loader'
// import Canvas from './components/canvas'
// import './App.css'

// export type Size = {
//   height: number
//   width: number
// }
// const App = () => {
//   const [size, setSize] = useState<Size | null>(null)
//   const container = useRef<any>()
  
//   useEffect(() => {
//     setTimeout(() => {
//       setSize({
//         height: container.current.clientHeight-20,
//         width: container.current.clientWidth-20,
//       })
//     }, 100)
//   })
//   return (
//     <div className="App" ref={container}>
//       {size ? <Canvas {...size} /> : <Loader />}
//     </div>
//   )
// }

// export default App
import React, { useState ,useRef, useEffect} from 'react'
import HomePage from './components/homepage/HomePage'
import Canvas from './components/canvas'
import './App.css'
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
        height: container.current.clientHeight-80,
        width: container.current.clientWidth,
      })
    }, 100)
  })
  const handlePlayClick = () => {
    setShowCanvas(true);
  };

  return (
    <div className="App" ref={container}>
      {!showCanvas && <HomePage onPlayClick={handlePlayClick} />}
      {showCanvas && size && <Canvas height={size.height} width={size.width} />}
    </div>
  );
};

export default App;
