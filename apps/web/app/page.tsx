"use client"


import { useRouter } from "next/navigation";
import { useState } from "react";


export default function Home() {

const [roomId, setRoomId] = useState("")
const router = useRouter()
  return <div className="flex h-screen justify-center items-center w-full ">

  <input type="text" placeholder="Room Id"  onChange={(e)=> {
    setRoomId(e.target.value)
  }}/>

  <button onClick={()=> {
    router.push(`/room/${roomId}`)
  }}>Click</button>

  </div>;
}
