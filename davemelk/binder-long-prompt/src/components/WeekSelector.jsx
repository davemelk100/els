import { Fragment } from "react";
import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { format, addWeeks, startOfWeek, endOfWeek } from "date-fns";
import useScheduleStore from "../store/scheduleStore";

const WeekSelector = () => {
  const { selectedWeek, setSelectedWeek } = useScheduleStore();

  // Generate array of next 12 weeks
  const weekOptions = Array.from({ length: 12 }, (_, i) => {
    const weekStart = startOfWeek(addWeeks(new Date(), i));
    return {
      value: weekStart,
      label: `${format(weekStart, "MMM d")} - ${format(
        endOfWeek(weekStart),
        "MMM d, yyyy"
      )}`,
    };
  });

  const currentWeekLabel = `${format(selectedWeek, "MMM d")} - ${format(
    endOfWeek(selectedWeek),
    "MMM d, yyyy"
  )}`;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
        <span className="mr-2">{currentWeekLabel}</span>
        <ChevronDownIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
      </Menu.Button>

      <Menu.Items className="absolute z-10 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="py-1">
          {weekOptions.map((week) => (
            <Menu.Item key={week.value.toISOString()}>
              {({ active }) => (
                <button
                  onClick={() => setSelectedWeek(week.value)}
                  className={`${
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                  } block w-full text-left px-4 py-2 text-sm`}
                >
                  {week.label}
                </button>
              )}
            </Menu.Item>
          ))}
        </div>
      </Menu.Items>
    </Menu>
  );
};

export default WeekSelector;
