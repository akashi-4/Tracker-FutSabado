"use client";

import { useSession } from "next-auth/react";
import { Trash2 } from "lucide-react";
import type { Match } from "../types/matchType";

type Props = {
  match: Match;                
  onDelete: (match: Match) => void;
};

export default function DeleteMatchButton({ match, onDelete }: Props) {
  const { data: session } = useSession();

  // Hide the control unless the user is logged-in and has role "admin"
  if (session?.user.role !== "admin") return null;

  const handleClick = () => {
    onDelete(match);
  };

  return (
    <button
      onClick={handleClick}
      className="btn-icon-danger"
      title="Delete Match"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
