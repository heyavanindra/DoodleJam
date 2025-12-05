"use client";
import React, { MouseEvent, useState } from "react";
import {
  Eye,
  EyeOff,
  Palette,
  ArrowRight,
  User,
  Lock,
  LogIn,
} from "lucide-react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@repo/common";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { z } from "zod";
import { authClient } from "@repo/auth/client";
import Link from "next/link";
type DataType = z.Infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });
  const redirect = useRouter();

  // Mouse tracking with framer motion
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    mouseX.set(e.clientX - 192);
    mouseY.set(e.clientY - 192);
  };

  const onSubmit: SubmitHandler<DataType> = async (data) => {

    try {
      await authClient.signIn.email(
        {
          email: data.username,
          password: data.password,
        },
        {
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
          onSuccess: (ctx) => {
            toast.success("Sign in successfull");
            redirect.push("/dashboard");
          },
        },
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${process.env.NEXT_PUBLIC_BETTER_AUTH_REDIRECT_URL}/dashboard`,
      });
    } catch (error) {
      console.error(error);
      toast.error("Google login failed");
    }
  };

  const handleGithubLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });
    } catch (error) {
      console.error(error);
      toast.error("GitHub login failed");
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

      {/* Login Card */}
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
              Welcome Back
            </motion.h2>
            <motion.p
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Sign in to continue your creative journey
            </motion.p>
          </motion.div>

          {/* Form */}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {/* Username Field */}
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
                  <User className="w-5 h-5 text-muted-foreground" />
                </motion.div>
                <motion.input
                  type="text"
                  {...register("username")}
                  placeholder="Username or Email"
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
                {errors.username && (
                  <p className="text-red-300 font-semibold">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
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
                <div>
                  {errors.password && (
                    <p className="text-red-300 font-semibold">
                      {errors.password.message}
                    </p>
                  )}
                </div>
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

              {/* Remember Me & Forgot Password */}
              <motion.div
                className="flex items-center justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <label className="flex items-center">
                  <motion.input
                    type="checkbox"
                    className="rounded border-border/50 text-primary focus:ring-primary/20 focus:ring-offset-0 bg-card/50"
                    whileTap={{ scale: 0.9 }}
                  />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Remember me
                  </span>
                </label>
                <motion.a
                  href="#"
                  className="text-sm text-primary font-medium"
                  whileHover={{
                    color: "rgba(var(--color-primary) / 0.8)",
                    scale: 1.05,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Forgot password?
                </motion.a>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                className="group w-full bg-gradient-to-r from-primary to-chart-2 text-primary-foreground py-4 rounded-xl font-semibold text-lg flex items-center justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  background:
                    "linear-gradient(to right, rgba(var(--color-primary) / 0.9), rgba(var(--color-chart-2) / 0.9))",
                }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
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
                  <LogIn className="w-5 h-5 mr-2" />
                </motion.div>
                Sign In
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <ArrowRight className="w-5 h-5 ml-2" />
                </motion.div>
              </motion.button>
            </div>
          </form>

          {/* Divider */}
          <motion.div
            className="my-8 flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="flex-1 border-t border-border/50"></div>
            <span className="px-4 text-sm text-muted-foreground">or</span>
            <div className="flex-1 border-t border-border/50"></div>
          </motion.div>

          {/* Social Login */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <motion.button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full border border-border/50 hover:border-border py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
              whileHover={{
                scale: 1.02,
                backgroundColor: "rgba(var(--color-muted) / 0.5)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </motion.button>

            <motion.button
              type="button"
              onClick={handleGithubLogin}
              className="w-full border border-border/50 hover:border-border py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
              whileHover={{
                scale: 1.02,
                backgroundColor: "rgba(var(--color-muted) / 0.5)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </motion.button>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <p className="text-muted-foreground">
              Don&apos;t have an account?{" "}
              <motion.a
                href="#"
                className="text-primary font-medium"
                whileHover={{
                  color: "rgba(var(--color-primary) / 0.8)",
                  scale: 1.05,
                }}
                whileTap={{ scale: 0.95 }}
              >
              <Link href="/signup">Sign Up</Link>
              </motion.a>
            </p>
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

export default Login;
