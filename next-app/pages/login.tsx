import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErrorMsg(error.message)
      return
    }

    // Send login notification
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'login',
        userId: data.user?.id,
      }),
    });

    router.push('/dashboard')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-lg rounded-xl p-6 w-80 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>

        {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Login
        </button>

        {/* Link to Register */}
        <p className="text-center text-sm text-gray-600">
          Don’t have an account?{' '}
          <Link href="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}
