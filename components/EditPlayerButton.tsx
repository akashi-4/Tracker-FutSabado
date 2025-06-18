"use client";

import { useSession } from "next-auth/react";
import { Pencil } from "lucide-react";
import type { Player } from "../types/playerType";

interface Props {
  player: Player;
  onEdit: (player: Player) => void;
}

export default function EditPlayerButton({ player, onEdit }: Props) {
  const { data: session } = useSession();

  if (session?.user.role !== "admin") return null;

  const handleClick = () => {
    onEdit(player);
  };

  return (
    <button
      onClick={handleClick}
      className="btn-icon-edit"
      title="Edit Player"
    >
      <Pencil className="w-4 h-4" />
    </button>
  );
}
