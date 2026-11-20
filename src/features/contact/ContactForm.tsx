'use client';

import { useActionState, useId } from 'react';
import type {
  ContactErrors,
  ContactInput,
  ContactState,
} from './validateContact';

type Props = {
  action: (
    prevState: ContactState,
    formData: FormData,
  ) => Promise<ContactState>;
};

export function ContactForm({ action }: Props) {
  const [state, formAction, isPending] = useActionState(action, {
    status: 'idle',
  });

  if (state.status === 'success') {
    return <p role="status">お問い合わせを受け付けました。</p>;
  }

  const errors: ContactErrors = state.status === 'error' ? state.errors : {};
  const values: Partial<ContactInput> =
    state.status === 'error' ? state.values : {};

  return (
    <form action={formAction} noValidate>
      {errors.form && <p role="alert">{errors.form}</p>}
      <Field
        name="name"
        label="お名前"
        defaultValue={values.name}
        error={errors.name}
      />
      <Field
        name="email"
        label="メールアドレス"
        type="email"
        defaultValue={values.email}
        error={errors.email}
      />
      <Field
        name="message"
        label="お問い合わせ内容"
        multiline
        defaultValue={values.message}
        error={errors.message}
      />
      <button type="submit" disabled={isPending}>
        {isPending ? '送信中…' : '送信'}
      </button>
    </form>
  );
}

type FieldProps = {
  name: string;
  label: string;
  type?: string;
  multiline?: boolean;
  defaultValue?: string;
  error?: string;
};

function Field({
  name,
  label,
  type = 'text',
  multiline,
  defaultValue,
  error,
}: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const common = {
    id,
    name,
    defaultValue,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
  };

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      {multiline ? <textarea {...common} /> : <input type={type} {...common} />}
      {error && <p id={errorId}>{error}</p>}
    </div>
  );
}
