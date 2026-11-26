'use client';

import { type KeyboardEvent, useEffect, useId, useRef } from 'react';

type Props = {
  book: { id: string; title: string } | null;
  pending?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteBookDialog({
  book,
  pending = false,
  error,
  onConfirm,
  onCancel,
}: Props) {
  const titleId = useId();
  const messageId = useId();
  const yesRef = useRef<HTMLButtonElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);

  // 開いたとき・削除処理が終わったとき（失敗してモーダルが残るとき）に「いいえ」へフォーカス
  useEffect(() => {
    if (book && !pending) {
      noRef.current?.focus();
    }
  }, [book, pending]);

  // Esc で閉じる（削除処理中は閉じない）
  useEffect(() => {
    if (!book) return;

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && !pending) {
        event.preventDefault();
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [book, pending, onCancel]);

  if (!book) return null;

  // Tab / Shift+Tab は「はい」「いいえ」の間だけを行き来する
  function handleTab(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    if (pending) return;
    const next =
      document.activeElement === yesRef.current
        ? noRef.current
        : yesRef.current;
    next?.focus();
  }

  function handleBackdropClick() {
    if (!pending) onCancel();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        data-testid="dialog-backdrop"
        aria-hidden="true"
        className="absolute inset-0 bg-black/50"
        onClick={handleBackdropClick}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        tabIndex={-1}
        onKeyDown={handleTab}
        className="relative w-full max-w-sm space-y-4 rounded bg-white p-6 shadow-lg outline-none"
      >
        <h2 id={titleId} className="text-lg font-bold">
          書籍の削除
        </h2>
        <p id={messageId}>『{book.title}』を削除しますか？</p>

        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            ref={yesRef}
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            はい
          </button>
          <button
            ref={noRef}
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            いいえ
          </button>
        </div>
      </div>
    </div>
  );
}
