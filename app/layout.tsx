import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Providers from "./providers";
import NavBar from "../components/NavBar";

const playerLinks = [
  { href: "/player/add-player", label: "Add Player" },
  { href: "/player/players-stats", label: "Players Stats" },
  { href: "/player/players-list", label: "Players List" },
];

const matchLinks = [
  { href: "/match/add-match", label: "Add Match" },
  { href: "/match/matches-list", label: "Matches List" },
];

export const metadata: Metadata = {
  title: "Futeba",
  description: "Futeba - Your Football Community",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
