"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useScheduleStore } from "@/lib/store/schedule-store";

interface ScheduleCellProps {
  day: string;
  timeSlot: string;
  rowIndex: number;
  section: string;
}

export function ScheduleCell({ day, timeSlot, rowIndex, section }: ScheduleCellProps) {
  const { getEventByDayAndTime, updateEvent } = useScheduleStore();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    const event = getEventByDayAndTime(day, timeSlot, rowIndex, section);
    if (event) {
      setContent(event.content);
    } else {
      setContent("");
    }
  }, [day, timeSlot, rowIndex, section, getEventByDayAndTime]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (content.trim()) {
      updateEvent({
        id: `${day}-${timeSlot}-${section}-${rowIndex}`,
        content,
        day,
        timeSlot,
        rowIndex,
        section,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <div
      className="min-h-[4rem] w-full h-full"
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <textarea
          className={cn(
            "w-full h-full min-h-[4rem] p-1 resize-none border rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            "bg-background text-foreground"
          )}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <div className="w-full h-full p-1 whitespace-pre-wrap">
          {content || (
            <span className="text-muted-foreground text-sm">
              Double click to add event
            </span>
          )}
        </div>
      )}
    </div>
  );
}