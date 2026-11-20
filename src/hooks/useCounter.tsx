import { useState } from 'react';

type Options = {
  initial?: number;
  min?: number;
  max?: number;
};

export function useCounter({
  initial = 0,
  min = 0,
  max = Infinity,
}: Options = {}) {
  const clamp = (n: number) => Math.min(Math.max(n, min), max);
  const [count, setCount] = useState(() => clamp(initial));

  function increment() {
    setCount((c) => clamp(c + 1));
  }

  function decrement() {
    setCount((c) => clamp(c - 1));
  }

  function reset() {
    setCount(initial);
  }

  return {
    count,
    canIncrement: count < max,
    canDecrement: count > min,
    increment,
    decrement,
    reset,
  };
}
