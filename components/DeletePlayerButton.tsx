"use client";

import { useSession } from "next-auth/react";
import { Trash2 } from "lucide-react";
import type { Player } from "../types/playerType";

interface Props {
  player: Player;
  onDelete: (name: string) => void;
}

export default function DeletePlayerButton({ player, onDelete }: Props) {
  const { data: session } = useSession();

  if (session?.user.role !== "admin") return null;

  const handleClick = () => {
    onDelete(player.name);
  };

  return (
    <button
      onClick={handleClick}
      className="btn-icon-danger"
      title="Delete Player"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
