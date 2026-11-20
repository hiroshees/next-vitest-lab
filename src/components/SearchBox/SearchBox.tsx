'use client';

import { useId, useState, type FormEvent } from 'react';

type Props = {
  onSearch: (keyword: string) => void;
};

export function SearchBox({ onSearch }: Props) {
  const [value, setValue] = useState('');
  const inputId = useId();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedValue = value.trim();
    if (trimmedValue === '') {
      return;
    }
    onSearch(trimmedValue);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor={inputId}>検索キーワード</label>
      <input
        id={inputId}
        value={value}
        type="search"
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit">検索</button>
    </form>
  );
}
