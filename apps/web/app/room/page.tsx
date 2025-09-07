"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-neutral-900 text-white">
      <div className="flex gap-3 p-6 rounded-xl bg-neutral-800 shadow-lg">
        <input
          type="text"
          placeholder="Room Id"
          className="px-3 py-2 rounded-lg bg-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-neutral-500"
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button
          onClick={() => router.push(`/room/${roomId}`)}
          className="px-4 py-2 rounded-lg bg-neutral-600 hover:bg-neutral-500 transition font-medium"
        >
          Join
        </button>
      </div>
    </div>
  );
}
