"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { TimeSlot } from "@/lib/types/schedule";
import { useScheduleStore } from "@/lib/store/schedule-store";

interface EditableTimeSlotProps {
  slot: TimeSlot;
  onUpdate: (slot: TimeSlot) => void;
}

export function EditableTimeSlot({ slot, onUpdate }: EditableTimeSlotProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(slot.label);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const newSlot = { ...slot, label: value };
    onUpdate(newSlot);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <div onDoubleClick={handleDoubleClick} className="w-full">
      {isEditing ? (
        <Input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="h-6 min-h-6 px-1 py-0 text-sm"
          autoFocus
        />
      ) : (
        <span className="text-sm font-medium">{value}</span>
      )}
    </div>
  );
}