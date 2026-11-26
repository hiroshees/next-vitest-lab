'use client';

import Link from 'next/link';
import { type ReactNode, useActionState, useId } from 'react';
import {
  type BookErrors,
  type BookFormState,
  type BookFormValues,
  GENRES,
} from './validateBook';

type Props = {
  action: (state: BookFormState, formData: FormData) => Promise<BookFormState>;
  submitLabel: '登録する' | '更新する';
  initialValues?: BookFormValues;
};

const EMPTY_VALUES: BookFormValues = {
  title: '',
  author: '',
  genre: '',
  publishedYear: '',
  memo: '',
};

const initialState: BookFormState = { status: 'idle' };

const inputClass =
  'w-full rounded border border-gray-300 px-3 py-2 aria-invalid:border-red-600 aria-invalid:bg-red-50';

type FieldA11y = {
  id: string;
  'aria-invalid': true | undefined;
  'aria-describedby': string | undefined;
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: (a11y: FieldA11y) => ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function BookForm({
  action,
  submitLabel,
  initialValues = EMPTY_VALUES,
}: Props) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  // エラーのときは入力した値を、それ以外は初期値を表示する
  const values = state.status === 'error' ? state.values : initialValues;
  const errors: BookErrors = state.status === 'error' ? state.errors : {};

  return (
    <form action={formAction} noValidate className="space-y-5">
      <p className="text-sm text-gray-600">メモ以外は必須です。</p>

      {errors.form && (
        <p
          role="alert"
          className="rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800"
        >
          {errors.form}
        </p>
      )}

      <Field label="タイトル" error={errors.title}>
        {(a11y) => (
          <input
            {...a11y}
            name="title"
            type="text"
            defaultValue={values.title}
            className={inputClass}
          />
        )}
      </Field>

      <Field label="著者" error={errors.author}>
        {(a11y) => (
          <input
            {...a11y}
            name="author"
            type="text"
            defaultValue={values.author}
            className={inputClass}
          />
        )}
      </Field>

      <Field label="ジャンル" error={errors.genre}>
        {(a11y) => (
          <select
            // React 19 は送信後に項目を初期値へ戻すが、select は最初の defaultValue しか使わない。
            // 値が変わったら作り直して、新しい値を初期値にする
            key={values.genre}
            {...a11y}
            name="genre"
            defaultValue={values.genre}
            className={inputClass}
          >
            <option value="">選択してください</option>
            {GENRES.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field label="出版年" error={errors.publishedYear}>
        {(a11y) => (
          <input
            {...a11y}
            name="publishedYear"
            type="text"
            inputMode="numeric"
            defaultValue={values.publishedYear}
            className={`${inputClass} max-w-32`}
          />
        )}
      </Field>

      <Field label="メモ" error={errors.memo}>
        {(a11y) => (
          <textarea
            {...a11y}
            name="memo"
            rows={4}
            defaultValue={values.memo}
            className={inputClass}
          />
        )}
      </Field>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel}
        </button>
        <Link
          href="/books"
          className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}
