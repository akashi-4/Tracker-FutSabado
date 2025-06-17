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

  return (
    <button
      onClick={() => onEdit(player)}
      className="p-2 rounded-lg bg-gray-700 hover:bg-blue-600"
      title="Edit player"
    >
      <Pencil className="w-4 h-4" />
    </button>
  );
}
