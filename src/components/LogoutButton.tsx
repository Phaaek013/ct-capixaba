"use client";

import { signOut } from "next-auth/react";
import React from "react";

export default function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={className ?? "px-3 py-1 rounded-md bg-transparent border border-transparent hover:bg-slate-700"}
    >
      Sair
    </button>
  );
}
