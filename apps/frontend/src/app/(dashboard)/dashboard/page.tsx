"use client";
import { authClient } from "@repo/auth/client";
import { useRouter } from "next/navigation";
// import { auth } from "@repo/auth/server";
// import { headers } from "next/headers";
import React, { useState } from "react";

const Dashboard = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  async function getName() {
    const session = await authClient.getSession();
    if (!session || !session.data) {
      return;
    }

    setName(session.data.user.name);
  }
  getName();

  return (
    <>
      {" "}
      <div>Name:{name} </div>;
      <button
        onClick={async () => {
          await authClient.signOut();
          router.push("/login");
        }}
      >
        Sign out
      </button>
    </>
  );
};

export default Dashboard;
