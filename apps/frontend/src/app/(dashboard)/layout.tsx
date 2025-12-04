"use client";
import { authClient } from "@repo/auth/client";
import { LogOut, Palette } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [name, setName] = useState("");
 useEffect(() => {
    async function getName() {
    const session = await authClient.getSession();
    console.log("session",session)
    if (!session || !session.data) {
      return;
    }
    setName(session.data.user.name);
  }
  getName();
 
 }, [])
 

  const router = useRouter();
  return (
    <>
      <motion.header
        className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-chart-2 rounded-xl flex items-center justify-center">
                <Palette className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                  DoodleJam
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {name || "User"}!
                </p>
              </div>
            </motion.div>

            <motion.button
              onClick={async () => {
                await authClient.signOut();
                router.push("/login");
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Sign Out</span>
            </motion.button>
          </div>
        </div>
      </motion.header>
      {children}
    </>
  );
}
