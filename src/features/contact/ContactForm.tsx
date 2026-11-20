'use client';

import { useActionState, useId } from 'react';
import {
  inquiryType,
  type ContactErrors,
  type ContactInput,
  type ContactState,
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
      <SelectField
        key={values.inquiry ?? 'empty'}
        name="inquiry"
        label="お問い合わせの種類"
        placeholder="選択してください"
        defaultValue={values.inquiry}
        options={inquiryType}
        error={errors.inquiry}
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

type SelectFieldProps = {
  name: string;
  label: string;
  options: string[];
  placeholder?: string;
  defaultValue?: string;
  error?: string;
  disabled?: boolean;
};

export function SelectField({
  name,
  label,
  options,
  placeholder,
  defaultValue,
  error,
  disabled,
}: SelectFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <p id={errorId}>{error}</p>}
    </div>
  );
}
