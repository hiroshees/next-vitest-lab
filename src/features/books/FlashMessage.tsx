type Props = { message?: string };

export function FlashMessage({ message }: Props) {
  if (!message) return null;

  return (
    <p
      role="status"
      className="rounded border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-800"
    >
      {message}
    </p>
  );
}
