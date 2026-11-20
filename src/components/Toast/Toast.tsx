'use client';

import { useEffect } from 'react';

type Props = {
  message: string;
  duration?: number;
  onClose: () => void;
};

export function Toast({ message, duration = 3000, onClose }: Props) {
  useEffect(() => {
    const id = setTimeout(onClose, duration);
    return () => clearTimeout(id);
  }, [duration, onClose]);

  return (
    <div role="status">
      <p>{message}</p>
      <button type="button" onClick={onClose}>
        閉じる
      </button>
    </div>
  );
}
