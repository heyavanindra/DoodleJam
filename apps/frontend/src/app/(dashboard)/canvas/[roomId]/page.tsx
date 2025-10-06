import Canvas from "@/components/canvas";
import { auth } from "@repo/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const RoomCanvas = async ({
  params,
}: {
  params: {
    roomId: string;
  };
}) => {
  const roomId = (await params).roomId;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  // console.log("session here",session?.user)
  if (!session) {
    redirect("/login");
  }
  return <Canvas roomId={roomId}></Canvas>;
};

export default RoomCanvas;
