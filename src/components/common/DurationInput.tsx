import React from 'react';
import InputWrapper from './InputWrapper';

// Hours + minutes number inputs with unit suffixes.
export default function DurationInput({
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
  hasError = false,
  inputClassName = '',
  idPrefix
}: { hours: string; minutes: string; onHoursChange: (value: string) => void; onMinutesChange: (value: string) => void; hasError?: boolean; inputClassName?: string; idPrefix?: string }) {
  const errorClass = hasError ? 'input-error' : '';
  return (
    <div className="flex gap-4 items-center">
      <InputWrapper suffix="ชั่วโมง" className="w-[140px]">
        <input
          type="number"
          id={idPrefix ? `${idPrefix}Hrs` : undefined}
          name={idPrefix ? `${idPrefix}Hrs` : undefined}
          value={hours}
          onChange={(e) => onHoursChange(e.target.value)}
          placeholder="00"
          min="0"
          className={`w-full pr-16 text-center ${inputClassName} ${errorClass}`}
        />
      </InputWrapper>
      <InputWrapper suffix="นาที" className="w-[140px]">
        <input
          type="number"
          id={idPrefix ? `${idPrefix}Mins` : undefined}
          name={idPrefix ? `${idPrefix}Mins` : undefined}
          value={minutes}
          onChange={(e) => onMinutesChange(e.target.value)}
          placeholder="00"
          min="0"
          max="59"
          className={`w-full pr-12 text-center ${inputClassName} ${errorClass}`}
        />
      </InputWrapper>
    </div>
  );
}
