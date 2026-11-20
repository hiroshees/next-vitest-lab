import { useState } from 'react';

export function useCharacterLimit(maxLength: number, initialValue = '') {
  const [value, setValue] = useState(initialValue);

  const length = value.length;
  const isOver = length > maxLength;
  const isBlank = value.trim() === '';

  return {
    value,
    setValue,
    length,
    maxLength,
    isOver,
    isBlank,
    canSubmit: !isBlank && !isOver,
    reset: () => setValue(''),
  };
}
