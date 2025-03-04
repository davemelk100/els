import { useState } from "react";
import { format, addDays } from "date-fns";
import useScheduleStore from "../store/scheduleStore";
import ScheduleCell from "./ScheduleCell";
import { PlusIcon } from "@heroicons/react/24/outline";

const ScheduleTable = () => {
  const { selectedWeek, scheduleData, addRow } = useScheduleStore();
  const [rowCount, setRowCount] = useState(1);

  const handleAddRow = () => {
    setRowCount((prev) => prev + 1);
    addRow();
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(selectedWeek, i);
    return format(date, "yyyy-MM-dd");
  });

  return (
    <div className="mt-4">
      <div className="schedule-grid grid-cols-7">
        {/* Generate cells for each day and row */}
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-7">
            {weekDays.map((day) => (
              <ScheduleCell
                key={`${day}-${rowIndex}`}
                day={day}
                rowIndex={rowIndex}
                initialValue={scheduleData[day]?.[rowIndex] || ""}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Add Row Button */}
      <button
        onClick={handleAddRow}
        className="mt-4 flex items-center justify-center w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors duration-200"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Add Row
      </button>
    </div>
  );
};

export default ScheduleTable;
