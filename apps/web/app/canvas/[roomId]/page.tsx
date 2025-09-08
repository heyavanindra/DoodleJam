import CanvasComponent from "../../../components/CanvasComponent";

const Canvas = async ({
  params,
}: {
  params: {
    roomId: string;
  };
}) => {
  const roomId = (await params).roomId;
  console.log(roomId);
  return <CanvasComponent roomId={roomId}></CanvasComponent>;
};

export default Canvas;
