"use client";
import { authClient } from "@repo/auth/client";
import { useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  LogOut,
  Plus,
  DoorOpen,
  Users,
  Clock,
  Palette,
  Search,
  ArrowRight,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AxiosError } from "axios";

type RoomProps = {
  name: string;
  id: string;
  adminId: string;
};

const Dashboard = () => {
  const router = useRouter();

  const [roomId, setRoomId] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [username, setUsername] = useState<string>();

  const handleJoinRoom = () => {
    router.push(`/canvas/${roomId}`);
  };
  const [rooms, setRooms] = useState<RoomProps[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const getRoom = async () => {
      setLoading(true);
      try {
        const response = await api.get("/room");
        console.log(response.data, "Response data");
        setRooms(response.data.rooms);
        console.log(response.data.rooms);
        setLoading(false);
      } catch (error) {
        toast.error("Something went wrong");
        console.error(error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    getRoom();
  }, []);

  // Skeleton room data
  // const rooms = [
  //   {
  //     id: "1",
  //     name: "Creative Doodles",
  //     participants: 5,
  //     createdAt: "2 hours ago",
  //     color: "from-blue-500 to-purple-500",
  //   },
  //   {
  //     id: "2",
  //     name: "Art Jam Session",
  //     participants: 3,
  //     createdAt: "5 hours ago",
  //     color: "from-pink-500 to-rose-500",
  //   },
  //   {
  //     id: "3",
  //     name: "Design Sprint",
  //     participants: 8,
  //     createdAt: "1 day ago",
  //     color: "from-green-500 to-teal-500",
  //   },
  // ];

  const handleCreateRoom = async (e: FormEvent) => {
    e.preventDefault();
    console.log("first");
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
      toast("Error while creating room");
    }

    console.log("Creating room with username:", username);
  };

  return (
    <Dialog>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        {/* Header */}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Action Buttons */}

          <motion.div
            className="grid md:grid-cols-2 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Create Room Card */}

            <motion.div
              className="group relative overflow-hidden bg-gradient-to-br from-primary to-chart-2 rounded-2xl p-8 text-left"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <DialogTrigger>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Plus className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Create New Room
                  </h2>
                  <p className="text-white/80 mb-4">
                    Start a new doodle session with friends
                  </p>
                  <div className="flex items-center text-white font-medium">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
                <motion.div
                  className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                />
              </DialogTrigger>
            </motion.div>
            <DialogContent>
              <form onSubmit={handleCreateRoom}>
                <DialogHeader>
                  <DialogTitle>Create Room</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when
                    you&apos;re done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="name-1">Name</Label>
                    <Input
                      id="name-1"
                      name="name"
                      defaultValue="Pedro Duarte"
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>

            {/* Join Room Card */}
            <motion.button
              onClick={() => setShowJoinModal(true)}
              className="group relative overflow-hidden bg-card/50 backdrop-blur-xl border-2 border-border/50 rounded-2xl p-8 text-left"
              whileHover={{
                scale: 1.02,
                y: -4,
                borderColor: "var(--color-primary)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative z-10">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <DoorOpen className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Join Room
                </h2>
                <p className="text-muted-foreground mb-4">
                  Enter a room ID to join an existing session
                </p>
                <div className="flex items-center text-primary font-medium">
                  Enter Room ID
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </motion.button>
          </motion.div>

          {/* Your Rooms Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Your Rooms</h2>
              <motion.button
                className="flex items-center space-x-2 px-4 py-2 bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </motion.button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <>loading</>
              ) : rooms.length === 0 ? (
                <p>NO rooms exists</p>
              ) : (
                rooms &&
                rooms.map((room, index) => (
                  <Link href={`/canvas/${room.id}`} key={room.id}>
                    {" "}
                    <motion.div
                      key={room.id}
                      className="group bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className={`w-full h-32 bg-neutral-100 rounded-xl mb-4 relative overflow-hidden`}
                      >
                        <motion.div
                          className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"
                          whileHover={{ scale: 1.1 }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Palette className="w-12 h-12 dark:text-white/50 text-neutral-600" />
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {room.name}
                      </h3>

                      <motion.div
                        className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <span className="text-sm text-muted-foreground">
                          Room ID: {room.id}
                        </span>
                        <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-2 transition-transform" />
                      </motion.div>
                    </motion.div>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        </main>

        {/* Join Room Modal */}
        {showJoinModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowJoinModal(false)}
          >
            <motion.div
              className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-8 max-w-md w-full"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <DoorOpen className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center text-foreground mb-2">
                Join Room
              </h2>
              <p className="text-center text-muted-foreground mb-6">
                Enter the room ID to join the session
              </p>

              <div className="space-y-4">
                <motion.input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter Room ID"
                  className="w-full px-4 py-3 bg-card/50 border-2 border-border/50 rounded-xl backdrop-blur-xl transition-all duration-300 placeholder-muted-foreground/50 text-foreground focus:outline-none focus:border-primary"
                  whileFocus={{ scale: 1.02 }}
                />

                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 px-4 py-3 bg-card/50 border border-border/50 rounded-xl font-medium text-muted-foreground hover:text-foreground transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-chart-2 text-primary-foreground rounded-xl font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleJoinRoom}
                  >
                    Join Room
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </Dialog>
  );
};

export default Dashboard;
