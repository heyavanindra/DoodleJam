"use client";
import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Palette,
  ArrowRight,
  Mail,
  User,
  Lock,
  UserCircle,
  Sparkles,
} from "lucide-react";
import { motion, useMotionValue, useSpring } from "motion/react";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { signupSchema } from "@repo/common";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { authClient } from "@repo/auth/client";

type User = z.Infer<typeof signupSchema>;
const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });
  const redirect = useRouter();

  // Mouse tracking with framer motion
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseX.set(e.clientX - 192);
    mouseY.set(e.clientY - 192);
  };

  const onSubmit: SubmitHandler<User> = async (data) => {
    try {
       await authClient.signUp.email(
        {
          email: data.email,
          password: data.password,
          name: data.name,
          callbackURL: "/",
        },

        {
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
          onSuccess: (ctx) => {
            toast.success("Sign Up successfull")
            redirect.push("/login");
          },
        }
      );
     
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data.message ||
          "Something went wrong while signing up"
      );
      console.error(error);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          style={{
            left: springX,
            top: springY,
          }}
        />
        <motion.div
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-chart-2/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-chart-3/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <motion.div
          className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
            type: "spring",
            stiffness: 100,
            damping: 15,
          }}
        >
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <motion.div
                className="w-10 h-10 bg-gradient-to-r from-primary to-chart-2 rounded-xl flex items-center justify-center"
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                  transition: { type: "spring", stiffness: 300, damping: 10 },
                }}
              >
                <Palette className="w-6 h-6 text-primary-foreground" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                DoodleJam
              </span>
            </div>
            <motion.h2
              className="text-3xl font-bold mb-2 text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Create Account
            </motion.h2>
            <motion.p
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Join thousands of creators and start collaborating
            </motion.p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <motion.div
              className="relative group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.div
                className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10"
                whileHover={{ scale: 1.1 }}
              >
                <UserCircle className="w-5 h-5 text-muted-foreground" />
              </motion.div>
              <motion.input
                type="text"
                placeholder="Full Name"
                {...register("name")}
                className="w-full pl-12 pr-4 py-4 bg-card/50 border-2 border-border/50 rounded-xl backdrop-blur-xl transition-all duration-300 placeholder-muted-foreground/50 text-foreground focus:outline-none"
                whileFocus={{
                  scale: 1.02,
                  borderColor: "var(--color-primary)",
                  boxShadow: "0 0 0 4px rgba(var(--color-primary) / 0.2)",
                  backgroundColor: "rgba(var(--color-card) / 0.8)",
                }}
                whileHover={{ borderColor: "var(--color-border)" }}
              />
              <div>
                {errors.name && (
                  <p className="text-red-300 font-semibold">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Username Field */}
            <motion.div
              className="relative group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <motion.div
                className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10"
                whileHover={{ scale: 1.1 }}
              >
                <User className="w-5 h-5 text-muted-foreground" />
              </motion.div>
              <motion.input
                type="text"
                {...register("username")}
                placeholder="Username"
                className="w-full pl-12 pr-4 py-4 bg-card/50 border-2 border-border/50 rounded-xl backdrop-blur-xl transition-all duration-300 placeholder-muted-foreground/50 text-foreground focus:outline-none"
                whileFocus={{
                  scale: 1.02,
                  borderColor: "var(--color-primary)",
                  boxShadow: "0 0 0 4px rgba(var(--color-primary) / 0.2)",
                  backgroundColor: "rgba(var(--color-card) / 0.8)",
                }}
                whileHover={{ borderColor: "var(--color-border)" }}
              />
            </motion.div>
            <div>
              <div>
                {errors.username && (
                  <p className="text-red-300 font-semibold">
                    {errors.username.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <motion.div
              className="relative group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <motion.div
                className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10"
                whileHover={{ scale: 1.1 }}
              >
                <Mail className="w-5 h-5 text-muted-foreground" />
              </motion.div>
              <motion.input
                type="email"
                {...register("email")}
                placeholder="Email Address"
                className="w-full pl-12 pr-4 py-4 bg-card/50 border-2 border-border/50 rounded-xl backdrop-blur-xl transition-all duration-300 placeholder-muted-foreground/50 text-foreground focus:outline-none"
                whileFocus={{
                  scale: 1.02,
                  borderColor: "var(--color-primary)",
                  boxShadow: "0 0 0 4px rgba(var(--color-primary) / 0.2)",
                  backgroundColor: "rgba(var(--color-card) / 0.8)",
                }}
                whileHover={{ borderColor: "var(--color-border)" }}
              />
            </motion.div>
            <div>
              {errors.email && (
                <p className="text-red-300 font-semibold">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <motion.div
              className="relative group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <motion.div
                className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10"
                whileHover={{ scale: 1.1 }}
              >
                <Lock className="w-5 h-5 text-muted-foreground" />
              </motion.div>
              <motion.input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Password"
                className="w-full pl-12 pr-12 py-4 bg-card/50 border-2 border-border/50 rounded-xl backdrop-blur-xl transition-all duration-300 placeholder-muted-foreground/50 text-foreground focus:outline-none"
                whileFocus={{
                  scale: 1.02,
                  borderColor: "var(--color-primary)",
                  boxShadow: "0 0 0 4px rgba(var(--color-primary) / 0.2)",
                  backgroundColor: "rgba(var(--color-card) / 0.8)",
                }}
                whileHover={{ borderColor: "var(--color-border)" }}
              />

              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  animate={{ rotateY: showPassword ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </motion.div>
              </motion.button>
            </motion.div>
            <div>
              {errors.password && (
                <p className="text-red-300 font-semibold">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="group w-full bg-gradient-to-r from-primary to-chart-2 text-primary-foreground py-4 rounded-xl font-semibold text-lg flex items-center justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              whileHover={{
                scale: 1.05,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                background:
                  "linear-gradient(to right, rgba(var(--color-primary) / 0.9), rgba(var(--color-chart-2) / 0.9))",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              >
                <Sparkles className="w-5 h-5 mr-2" />
              </motion.div>
              Create Account
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.div>
            </motion.button>
          </form>

          {/* Footer */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="text-muted-foreground">
              Already have an account?{" "}
              <motion.div
                className="text-primary font-medium"
                whileHover={{
                  color: "rgba(var(--color-primary) / 0.8)",
                  scale: 1.05,
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href={"/login"}>Sign In</Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            className="absolute -top-4 -right-4 w-8 h-8 bg-chart-2/20 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-4 -left-4 w-6 h-6 bg-chart-3/20 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SignUp;
