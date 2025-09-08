"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { signupSchema } from "@repo/common/types";
import { z } from "zod";
import api from "../../../utils/api";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const Signup = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const submitHandler = async (data: z.infer<typeof signupSchema>) => {
    try {
      const res = await api.post("/auth/signup", data);
      if (res.status === 201) {
        router.push("/login");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      const AxiosError = error as AxiosError<{ message: string }>;
      toast.error(AxiosError.response?.data.message || "Error while signup");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-900 px-4">
      <form
        onSubmit={handleSubmit(submitHandler)}
        className="w-full max-w-md rounded-2xl bg-neutral-800 p-8 shadow-lg"
      >
        <h2 className="mb-6 text-center text-2xl font-bold text-neutral-100">
          Sign Up
        </h2>

        {/* Name */}
        <label
          htmlFor="name"
          className="block text-sm font-medium text-neutral-300"
        >
          Name
        </label>
        <input
          type="text"
          placeholder="name"
          {...register("name")}
          className="mt-1 mb-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 focus:outline-none"
        />
        {errors.name && (
          <p className="mb-3 text-sm text-red-400">{errors.name.message}</p>
        )}

        {/* Username */}
        <label className="block text-sm font-medium text-neutral-300">
          Username
        </label>
        <input
          type="text"
          placeholder="username"
          {...register("username")}
          className="mt-1 mb-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 focus:outline-none"
        />
        {errors.username && (
          <p className="mb-3 text-sm text-red-400">{errors.username.message}</p>
        )}

        {/* Email */}
        <label className="block text-sm font-medium text-neutral-300">
          Email
        </label>
        <input
          type="text"
          placeholder="email"
          {...register("email")}
          className="mt-1 mb-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 focus:outline-none"
        />
        {errors.email && (
          <p className="mb-3 text-sm text-red-400">{errors.email.message}</p>
        )}

        {/* Password */}
        <label className="block text-sm font-medium text-neutral-300">
          Password
        </label>
        <input
          type="password"
          placeholder="password"
          {...register("password")}
          className="mt-1 mb-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 focus:outline-none"
        />
        {errors.password && (
          <p className="mb-3 text-sm text-red-400">{errors.password.message}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 w-full rounded-lg bg-neutral-700 px-4 py-2 font-medium text-neutral-100 hover:bg-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default Signup;
