
import React from 'react';

interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const IntensitySlider: React.FC<IntensitySliderProps> = ({ value, onChange, disabled = false }) => {
  return (
    <div className="w-full max-w-md">
      <label htmlFor="intensity-slider" className="block text-center text-lg font-medium text-gray-400 mb-2">
        Enhancement Intensity: <span className="font-bold text-indigo-400">{value}%</span>
      </label>
      <input
        id="intensity-slider"
        type="range"
        min="0"
        max="100"
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        disabled={disabled}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-md disabled:[&::-webkit-slider-thumb]:bg-indigo-800"
      />
    </div>
  );
};

export default IntensitySlider;
