"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

type LinkItem = { href: string; label: string; adminOnly?: boolean };

const playerLinks: LinkItem[] = [
  { href: "/player/add-player", label: "Add Player", adminOnly: true },
  { href: "/player/players-stats", label: "Players Stats" },
  { href: "/player/players-list", label: "Players List" },
];

const matchLinks: LinkItem[] = [
  { href: "/match/add-match", label: "Add Match", adminOnly: true },
  { href: "/match/matches-list", label: "Matches List" },
];

export default function NavBar() {
  const { data: session, status } = useSession();

  const authButton = () => {
    if (status === "loading") return null;
    if (!session) {
      return (
        <button
          onClick={() => signIn(undefined, { callbackUrl: "/" })}
          className="border border-blue-400 rounded-md px-3 py-1 hover:bg-blue-600 hover:text-white transition"
        >
          Login
        </button>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-300 hidden sm:block">
          {session.user?.email ?? session.user?.name}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="border border-red-400 text-red-400 rounded-md px-3 py-1 hover:bg-red-600 hover:text-white transition"
        >
          Logout
        </button>
      </div>
    );
  };

  return (
    <nav className="bg-black text-blue-400 p-4 flex justify-between font-bold">
      <h1 className="text-xl font-bold">Futebolada</h1>
      <div className="space-x-6 flex items-center">
        <Link href="/" className="hover:underline">Home</Link>

        {/* Player Dropdown */}
        <div className="relative group">
          <span className="cursor-pointer hover:underline">Player</span>
          <div className="absolute hidden group-hover:block w-40 right-0 pt-2 z-50">
            <div className="bg-black border border-blue-900 rounded-lg shadow-lg p-2 space-y-2">
              {playerLinks
                .filter((l) => !l.adminOnly || session?.user.role === "admin")
                .map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block hover:underline"
                  >
                    {link.label}
                  </Link>
                ))}
            </div>
          </div>
        </div>

        {/* Match Dropdown */}
        <div className="inline-block relative group">
          <span className="cursor-pointer hover:underline">Match</span>
          <div className="absolute hidden group-hover:block w-40 right-0 pt-2">
            <div className="bg-black border border-blue-900 rounded-lg shadow-lg p-2 space-y-2">
              {matchLinks
                .filter((l) => !l.adminOnly || session?.user.role === "admin")
                .map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block hover:underline"
                  >
                    {link.label}
                  </Link>
                ))}
            </div>
          </div>
        </div>

        {/* Auth Buttons */}
        {authButton()}
      </div>
    </nav>
  );
} 