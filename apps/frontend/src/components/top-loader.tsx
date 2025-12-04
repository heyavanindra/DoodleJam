"use client";
import { useTheme } from "next-themes";
import NextTopLoader from "nextjs-toploader";

const TopLoader = () => {
  const { theme } = useTheme();
  return (
    <NextTopLoader
      height={3}
      showSpinner={false}
      color={
        theme === "dark" ? "var(--color-orange-200)" : "var(--color-orange-800)"
      }
    ></NextTopLoader>
  );
};

export default TopLoader;
