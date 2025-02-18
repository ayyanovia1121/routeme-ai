"use client";
import { useEffect, useState } from "react";

// This hook is used to check if the component is mounted or not. It returns a boolean value.
const useMounted = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
};
export default useMounted;
