"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const authButton = () => {
    if (status === "loading") return null;
    if (!session) {
      return (
        <button
          onClick={() => {
            signIn(undefined, { callbackUrl: "/" });
            closeMenu();
          }}
          className="rounded-md hover:underline hover:text-white transition w-full md:w-auto text-center"
        >
          Login
        </button>
      );
    }
    return (
      <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
        <span className="text-sm text-gray-300 text-center md:text-left">
          {session.user?.email ?? session.user?.name}
        </span>
        <button
          onClick={() => {
            signOut({ callbackUrl: "/" });
            closeMenu();
          }}
          className="text-red-400 rounded-md hover:underline hover:text-white transition w-full md:w-auto text-center"
        >
          Logout
        </button>
      </div>
    );
  };

  return (
    <nav className="bg-black text-blue-400 font-bold w-full">
      <div className="px-4 py-3 w-full !p-0">
        <div className="flex items-center justify-between w-full">
            <Link href="/" className="text-xl font-bold hover:text-blue-300 transition-colors">
              Futebolada
            </Link>
            
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
            {/* Desktop Player Dropdown */}
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
                        className="block hover:underline px-2 py-1 rounded hover:bg-gray-800"
                      >
                        {link.label}
                      </Link>
                    ))}
                </div>
              </div>
            </div>

            {/* Desktop Match Dropdown */}
            <div className="relative group">
              <span className="cursor-pointer hover:underline">Match</span>
              <div className="absolute hidden group-hover:block w-40 right-0 pt-2 z-50">
                <div className="bg-black border border-blue-900 rounded-lg shadow-lg p-2 space-y-2">
                  {matchLinks
                    .filter((l) => !l.adminOnly || session?.user.role === "admin")
                    .map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block hover:underline px-2 py-1 rounded hover:bg-gray-800"
                      >
                        {link.label}
                      </Link>
                    ))}
                </div>
              </div>
            </div>

            {/* Desktop Auth */}
            {authButton()}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-4 border-t border-gray-700 pt-4">
            {/* Mobile Player Section */}
            <div>
              <button
                onClick={() => toggleDropdown('player')}
                className="flex items-center justify-between w-full py-2 hover:underline"
              >
                <span>Players</span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform ${
                    activeDropdown === 'player' ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              {activeDropdown === 'player' && (
                <div className="ml-4 mt-2 space-y-2">
                  {playerLinks
                    .filter((l) => !l.adminOnly || session?.user.role === "admin")
                    .map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block hover:underline py-1 text-gray-300"
                        onClick={closeMenu}
                      >
                        {link.label}
                      </Link>
                    ))}
                </div>
              )}
            </div>

            {/* Mobile Match Section */}
            <div>
              <button
                onClick={() => toggleDropdown('match')}
                className="flex items-center justify-between w-full py-2 hover:underline"
              >
                <span>Matches</span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform ${
                    activeDropdown === 'match' ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              {activeDropdown === 'match' && (
                <div className="ml-4 mt-2 space-y-2">
                  {matchLinks
                    .filter((l) => !l.adminOnly || session?.user.role === "admin")
                    .map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block hover:underline py-1 text-gray-300"
                        onClick={closeMenu}
                      >
                        {link.label}
                      </Link>
                    ))}
                </div>
              )}
            </div>

            {/* Mobile Auth */}
            <div className="border-t border-gray-700 pt-4">
              {authButton()}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 