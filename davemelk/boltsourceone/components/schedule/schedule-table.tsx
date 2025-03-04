"use client";

import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { ScheduleCell } from "./schedule-cell";
import { EditableTimeSlot } from "./editable-time-slot";
import { getCurrentWeekDates } from "@/lib/utils/date";
import { generateTimeSlots } from "@/lib/utils/time";
import { scheduleConfig } from "@/lib/config/schedule";
import { useScheduleStore } from "@/lib/store/schedule-store";

export function ScheduleTable() {
  const weekDays = getCurrentWeekDates();
  const { timeSlots, updateTimeSlot, sections, addRow, deleteRow } = useScheduleStore();

  useEffect(() => {
    if (timeSlots.length === 0) {
      const initialTimeSlots = generateTimeSlots(
        scheduleConfig.startHour,
        scheduleConfig.endHour,
        scheduleConfig.intervalMinutes
      );
      initialTimeSlots.forEach((slot, index) => updateTimeSlot(index, slot));
    }
  }, [timeSlots.length, updateTimeSlot]);

  return (
    <div className="w-full max-w-[95vw] mx-auto p-4">
      <Tabs defaultValue={weekDays[0].day} className="w-full">
        <TabsList className="w-full mb-4 grid grid-cols-7 gap-1 h-auto">
          {weekDays.map(({ day, date }) => (
            <TabsTrigger 
              key={day} 
              value={day} 
              className="min-h-[3.5rem] px-2 py-2 data-[state=active]:bg-primary/10 flex flex-col items-center justify-center"
            >
              <span className="font-medium text-sm truncate w-full text-center">
                {day}
              </span>
              <span className="text-xs text-muted-foreground">
                {date}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        {weekDays.map(({ day }) => (
          <TabsContent key={day} value={day}>
            <div className="overflow-x-auto">
              {sections.map((section) => (
                <div key={section.id} className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                    <Button
                      onClick={() => addRow(section.id)}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Row
                    </Button>
                  </div>
                  <table className="w-full border-collapse mb-4">
                    <thead>
                      <tr>
                        <th className="w-8 p-2"></th>
                        {timeSlots.map((slot, index) => (
                          <th
                            key={slot.value}
                            className="border p-2 bg-muted text-muted-foreground font-medium"
                          >
                            <EditableTimeSlot
                              slot={slot}
                              onUpdate={(updatedSlot) => updateTimeSlot(index, updatedSlot)}
                            />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: section.rows }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                          <td className="w-8 p-2">
                            {section.rows > 1 && (
                              <Button
                                onClick={() => deleteRow(section.id, rowIndex)}
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                          {timeSlots.map((slot) => (
                            <td
                              key={`${slot.value}-${rowIndex}`}
                              className="border p-2 h-24 align-top hover:bg-muted/50 transition-colors"
                            >
                              <ScheduleCell
                                day={day}
                                timeSlot={slot.label}
                                rowIndex={rowIndex}
                                section={section.id}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}