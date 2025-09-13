import { useState } from "react";
import { useRouter } from "next/router";
import { createClient } from '@supabase/supabase-js';
import { SITE_URL } from "../lib/constants";
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Register() {
  const router = useRouter();
  const [firstname, setFirstname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Redirect URL:', process.env.NEXT_PUBLIC_SITE_URL + '/dashboard');

    // ✅ Create user in auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: firstname }, // goes to raw_user_meta_data
        emailRedirectTo: SITE_URL + '/dashboard'

      },
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "Registration successful! Please check your email to confirm before logging in."
    );

    // Send notification
  await fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'register',
      userId: data.user?.id, // from Supabase
    }),
  });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white shadow-lg rounded-xl p-6 w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Register</h2>

        {message && <p className="text-blue-600 text-sm">{message}</p>}

        <input
          type="text"
          placeholder="First Name"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Register
        </button>
        <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
        <Link href="/login" className="text-blue-500 hover:underline">
            Login
        </Link>
        </p>

      </form>
    </div>
  );
}

