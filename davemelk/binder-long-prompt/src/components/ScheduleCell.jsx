import { useState, useEffect, useRef } from "react";
import useScheduleStore from "../store/scheduleStore";

const ScheduleCell = ({ day, rowIndex, initialValue = "" }) => {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);
  const { updateCell } = useScheduleStore();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    updateCell(day, rowIndex, value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  return (
    <div
      className="schedule-cell p-2 min-h-[60px] cursor-text"
      onClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full h-full bg-transparent outline-none"
        />
      ) : (
        <span className="block w-full h-full">{value}</span>
      )}
    </div>
  );
};

export default ScheduleCell;
