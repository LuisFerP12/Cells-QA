// components/SessionProviderWrapper.js
"use client";
// import "../app/globals.css";

import { SessionProvider } from "next-auth/react";

export default function SessionProviderWrapper({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
