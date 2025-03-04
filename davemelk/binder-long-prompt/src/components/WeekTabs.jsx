import { useState } from "react";
import { format, addDays, isToday } from "date-fns";
import useScheduleStore from "../store/scheduleStore";

const WeekTabs = () => {
  const { selectedWeek } = useScheduleStore();
  const [activeTab, setActiveTab] = useState(format(new Date(), "yyyy-MM-dd"));

  // Generate array of 7 days starting from selectedWeek
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(selectedWeek, i);
    return {
      date: format(date, "yyyy-MM-dd"),
      dayName: format(date, "EEE"),
      dayNumber: format(date, "d"),
      month: format(date, "MMM"),
    };
  });

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {weekDays.map((day) => {
          const isActive = activeTab === day.date;
          return (
            <button
              key={day.date}
              onClick={() => setActiveTab(day.date)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  isActive
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500">{day.month}</span>
                <span className="text-lg font-semibold">{day.dayNumber}</span>
                <span className="text-xs">{day.dayName}</span>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default WeekTabs;
