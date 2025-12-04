"use client";
import api from "@/lib/api";
import { AxiosError } from "axios";
import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const CreateRoom = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");

  const handleCreateRoom = async () => {
    try {
      const response = await api.post("/room", {
        name: username,
      });
      toast.success(response.data.message || "Room created");
      //  const roomId = response.data.slug
      //  redirect(`${roomId}`)
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.warning(
        axiosError.response?.data.message || "Something went wrong",
      );
      console.error(error);
    }

    console.log("Creating room with username:", username);
  };

  const handleJoinRoom = () => {
    redirect(`/canvas/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎮 Game Room</h1>
          <p className="text-gray-400">
            Create or join a room to start playing
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 mb-6 bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("create")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === "create"
                ? "bg-purple-600 text-white shadow-lg"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Create Room
          </button>
          <button
            onClick={() => setActiveTab("join")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === "join"
                ? "bg-purple-600 text-white shadow-lg"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Join Room
          </button>
        </div>

        {/* Form Content */}
        <div className="space-y-4">
           {/*Username Input (Common for both) */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              name
            </label>
            <input
              id="name"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Conditional Input based on active tab */}
          {activeTab === "join" && (
            <div>
              <label
                htmlFor="roomId"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Room ID
              </label>
              <input
                id="roomId"
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={activeTab === "create" ? handleCreateRoom : handleJoinRoom}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            {activeTab === "create" ? "🚀 Create Room" : "🎯 Join Room"}
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-sm text-center">
            {activeTab === "create"
              ? "A unique room ID will be generated for you"
              : "Get the room ID from your friend"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
