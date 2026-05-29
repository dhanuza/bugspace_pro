import { useState } from "react";

interface ToggleProps {
  label: string;
  defaultOn?: boolean;
  onChange?: (value: boolean) => void;
}

export default function Toggle({ label, defaultOn = false, onChange }: ToggleProps) {
  const [enabled, setEnabled] = useState(defaultOn);

  const handleToggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    if (onChange) onChange(newValue);
  };

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-600">{label}</span>
      <button
        onClick={handleToggle}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
          enabled ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
            enabled ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
