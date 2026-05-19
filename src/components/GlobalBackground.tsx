"use client";

import { useEffect, useState } from "react";

export default function GlobalBackground() {
  const [wallpaper, setWallpaper] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((cfg) => setWallpaper(cfg.homeWallpaper || ""))
      .catch(() => {});
  }, []);

  if (!wallpaper) return null;

  return (
    <div
      className="fixed inset-0 -z-10"
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    />
  );
}
