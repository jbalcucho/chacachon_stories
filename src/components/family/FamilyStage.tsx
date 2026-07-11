"use client";

import { useState } from "react";
import FamilyMemberChip from "@/components/family/FamilyMemberChip";
import type {
  FamilyAdultDraft,
  FamilyBuilderState,
  FamilyChildDraft,
  FamilyMemberDraft,
  FamilyPetDraft,
} from "@/lib/family-profile-builder";

type ZoneId = "ninos" | "adultos" | "mascotas";

type Props = {
  state: FamilyBuilderState;
  selectedId: string | null;
  onSelect: (member: FamilyMemberDraft) => void;
  onAdd: (zone: ZoneId) => void;
  onReorderChild: (fromId: string, toId: string) => void;
};

export default function FamilyStage({
  state,
  selectedId,
  onSelect,
  onAdd,
  onReorderChild,
}: Props) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overZone, setOverZone] = useState<ZoneId | null>(null);

  function renderZone(
    zone: ZoneId,
    title: string,
    members: FamilyMemberDraft[],
    empty: string,
    canDragChildren: boolean,
  ) {
    return (
      <div
        className={`family-room${overZone === zone ? " family-room--over" : ""}`}
        onDragOver={(e) => {
          if (!canDragChildren || !dragId) return;
          e.preventDefault();
          setOverZone(zone);
        }}
        onDragLeave={() => setOverZone((z) => (z === zone ? null : z))}
        onDrop={(e) => {
          e.preventDefault();
          setOverZone(null);
          const fromId = e.dataTransfer.getData("text/plain");
          if (!canDragChildren || !fromId) return;
          const target = (e.target as HTMLElement).closest<HTMLElement>(
            "[data-member-id]",
          );
          const toId = target?.dataset.memberId;
          if (toId && toId !== fromId) onReorderChild(fromId, toId);
          setDragId(null);
        }}
      >
        <div className="family-room__head">
          <h3 className="family-room__title">{title}</h3>
          <button
            type="button"
            className="family-room__add"
            onClick={() => onAdd(zone)}
          >
            + Añadir
          </button>
        </div>
        <div className="family-room__chips">
          {members.length === 0 ? (
            <p className="family-room__empty">{empty}</p>
          ) : (
            members.map((member) => (
              <div key={member.id} data-member-id={member.id}>
                <FamilyMemberChip
                  member={member}
                  selected={selectedId === member.id}
                  draggable={canDragChildren}
                  onSelect={() => onSelect(member)}
                  onDragStart={setDragId}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverZone(null);
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="family-rooms" aria-label="Habitantes de la casa">
      {renderZone(
        "ninos",
        "Niños",
        state.ninos as FamilyChildDraft[],
        "Toca + Añadir para el protagonista",
        true,
      )}
      {renderZone(
        "adultos",
        "Adultos",
        state.adultos as FamilyAdultDraft[],
        "Mamá, papá u otro cuidador",
        false,
      )}
      {renderZone(
        "mascotas",
        "Mascotas",
        state.mascotas as FamilyPetDraft[],
        "Opcional",
        false,
      )}
    </div>
  );
}
