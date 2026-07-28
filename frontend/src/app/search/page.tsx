'use client';
import { useState } from 'react';
import Cookies from 'js-cookie';

export default function Search() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/users/search?name=${encodeURIComponent(keyword)}`, {
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Search failed');
      setResults(data);
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const sendRequest = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/friends/request/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      });
      const data = await res.json();
      alert(data.message || 'Action completed');
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
  };

  const followUser = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/follow/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      });
      const data = await res.json();
      alert(data.message || 'Action completed');
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Search Users</h2>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} className="flex-1 border p-2 rounded" placeholder="Search by name..." />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Search</button>
      </form>

      {message && <p className="mb-4 text-red-500">{message}</p>}

      <div>
        {results.map((user: any) => (
          <div key={user._id} className="flex justify-between items-center border-b py-4">
            <div>
              <p className="font-bold">{user.name}</p>
              {user.isProfileLocked && <p className="text-xs text-red-500">🔒 Profile Locked</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => sendRequest(user._id)} className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300">Add Friend</button>
              <button onClick={() => followUser(user._id)} className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-200">Follow</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
