"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "../../../utils/api";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState<string | null>(null);
  const router = useRouter();

  const createRoom = async () => {
    try {
      const response = await api.post("/room", {
        name:roomName
      });
      console.log(response.data)
      setRoomId(response.data.roomId);
      toast.success("Room is created");
      router.push(`/canvas/${response.data.roomId}`);
    } catch (error) {
      console.error(error);
      const axiosError = error as AxiosError<{ message: string }>;
      toast(axiosError.response?.data.message || "Error while creating room");
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-neutral-900 text-white">
      <div className="flex flex-col items-center gap-8">
        {/* Create Room Section */}
        <div className="flex flex-col gap-4 rounded-xl bg-neutral-800 p-6 shadow-lg w-80">
          <h1 className="text-xl font-semibold text-center">Create Room</h1>
          <input
            type="text"
            placeholder="Enter room name"
            className="rounded-lg bg-neutral-700 px-3 py-2 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            onChange={(e) => setRoomName(e.target.value)}
          />
          <button
            onClick={createRoom}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium transition hover:bg-blue-500"
          >
            Create
          </button>
        </div>

        {/* Join Room Section */}
        <div className="flex gap-3 rounded-xl bg-neutral-800 p-6 shadow-lg w-80">
          <input
            type="text"
            placeholder="Enter Room Id"
            className="flex-1 rounded-lg bg-neutral-700 px-3 py-2 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button
            onClick={() => router.push(`/canvas/${roomId}`)}
            className="rounded-lg bg-green-600 px-4 py-2 font-medium transition hover:bg-green-500"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
