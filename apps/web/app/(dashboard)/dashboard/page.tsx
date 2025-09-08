"use client";
import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { useRouter } from "next/navigation";
type RoomProps ={
    slug:string,
    id:number,
    adminId:string,
    createdAt:Date,
}


const Page = () => {
  const [rooms, setRooms] = useState<RoomProps[] | null>();
  const router = useRouter()
  const getAllRooms = async () => {
    const res = await api.get("/room/all");
    setRooms(res.data.message);
  };
  useEffect(() => {
    getAllRooms();
  }, []);

  
  return <div className="bg-primary h-screen flex flex-col justify-center items-center w-full">
    <div>
        
        <button className="text-white" onClick={()=>{
            router.push("/room")
        }}>CreateRoom</button>
    </div>
    {rooms ?  rooms.map((room,idx)=>(
        <div key={idx}>
            {room.slug}
        </div>
    )) : <div className="text-white flex justify-center  items-center">No room exist</div>}
  </div>;
};

export default Page;
