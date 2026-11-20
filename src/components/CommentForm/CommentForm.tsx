import { useId, type FormEvent } from 'react';
import { useCharacterLimit } from '../../hooks/useCharacterLimit';

const MAX_LENGTH = 140;

type Props = {
  onSubmit: (comment: string) => void;
};

export function CommentForm({ onSubmit }: Props) {
  const { value, setValue, length, isOver, canSubmit, reset } =
    useCharacterLimit(MAX_LENGTH);
  const textareaId = useId();
  const errorId = useId();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(value.trim());
    reset();
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor={textareaId}>コメント</label>
      <textarea
        id={textareaId}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-invalid={isOver}
        aria-describedby={isOver ? errorId : undefined}
      />
      <p>
        {length} / {MAX_LENGTH}
      </p>
      {isOver && (
        <p id={errorId} role="alert">
          {MAX_LENGTH}文字以内で入力してください
        </p>
      )}
      <button type="submit" disabled={!canSubmit}>
        送信
      </button>
    </form>
  );
}
