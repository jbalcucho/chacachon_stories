"use client";

import type { FamilyMemberDraft } from "@/lib/family-profile-builder";
import {
  adultRoleLabel,
  displayName,
} from "@/lib/family-profile-builder";

type Props = {
  member: FamilyMemberDraft;
  selected?: boolean;
  draggable?: boolean;
  onSelect: () => void;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
};

function emojiFor(member: FamilyMemberDraft): string {
  if (member.kind === "mascota") return "🐾";
  if (member.kind === "nino") return "🧒";
  if (member.rol === "mama" || member.rol === "madrastra") return "👩";
  if (member.rol === "papa" || member.rol === "padrastro") return "👨";
  return "🧑";
}

function subtitle(member: FamilyMemberDraft): string {
  if (member.kind === "nino") return member.apodo ? member.nombre : "Niño/a";
  if (member.kind === "mascota")
    return member.personalidad || "Mascota";
  return adultRoleLabel(member.rol);
}

export default function FamilyMemberChip({
  member,
  selected = false,
  draggable = false,
  onSelect,
  onDragStart,
  onDragEnd,
}: Props) {
  const label = displayName(member);

  return (
    <button
      type="button"
      className={`family-chip${selected ? " family-chip--selected" : ""}`}
      onClick={onSelect}
      draggable={draggable}
      onDragStart={(e) => {
        if (!draggable) return;
        e.dataTransfer.setData("text/plain", member.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.(member.id);
      }}
      onDragEnd={() => onDragEnd?.()}
      aria-pressed={selected}
    >
      <span className="family-chip__emoji" aria-hidden="true">
        {emojiFor(member)}
      </span>
      <span className="family-chip__text">
        <span className="family-chip__name">{label}</span>
        <span className="family-chip__meta">{subtitle(member)}</span>
      </span>
    </button>
  );
}
