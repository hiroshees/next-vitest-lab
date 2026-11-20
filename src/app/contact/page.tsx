import { ContactForm } from '@/features/contact/ContactForm';
import { submitContact } from '@/features/contact/actions';
import { Suspense } from 'react';

export default function ContactPage() {
  return (
    <main>
      <h1>お問い合わせ</h1>
      <ContactForm action={submitContact} />
    </main>
  );
}
