import Canvas from "@/components/canvas";

const RoomCanvas= async ({params}:{
  params:{
    roomId:string
  }
}) => {
  const roomId = (await params).roomId
  

  return (
   <Canvas roomId={roomId}></Canvas>
  );
};

export default RoomCanvas;