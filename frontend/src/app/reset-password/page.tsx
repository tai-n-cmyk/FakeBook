'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');
      
      setMessage('Password reset successful. Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
      <h2 className="text-2xl mb-4 font-bold">Reset Password</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {message && <p className="text-green-500 mb-4">{message}</p>}
      <div className="mb-4">
        <label className="block mb-1">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-2 rounded" required />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Reset Code (Dummy 123456)</label>
        <input type="text" value={code} onChange={e => setCode(e.target.value)} className="w-full border p-2 rounded" required />
      </div>
      <div className="mb-4">
        <label className="block mb-1">New Password</label>
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border p-2 rounded" required />
      </div>
      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Reset Password</button>
    </form>
  );
}

export default function ResetPassword() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
