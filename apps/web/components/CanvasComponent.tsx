"use client"

import React, { useEffect, useRef, useState } from 'react'
import {RenderCanvasShapes} from '../utils/canvas';
import { WEBSOCKET_URL } from '../app/config';

const CanvasComponent = () => {
      const canvasRef = useRef<HTMLCanvasElement>(null);
      const [socket, setSocket] = useState<WebSocket | null>(null)
      useEffect(() => {
        const ws  = new WebSocket(WEBSOCKET_URL)
        ws.onopen = () => {
            setSocket(ws)
        }
       
      }, [])
      
      useEffect(() => {
        if (canvasRef.current) {
          canvasRef.current.width = window.innerWidth;
          canvasRef.current.height = window.innerHeight;
          RenderCanvasShapes(canvasRef.current);
        } 



      }, [canvasRef]);

      if (!socket) {
        return <div className=' absolute inset-0 h-screen w-full justify-center  items-center bg-black text-9xl text-center'>Loading...</div>
      }

  return (
    <>
         <div className="">
      <canvas
        className="bg-black outline-1"
        ref={canvasRef}
      ></canvas>
    </div>
    </>
  )
}

export default CanvasComponent