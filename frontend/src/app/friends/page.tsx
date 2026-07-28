'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';
import Link from 'next/link';

export default function Friends() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users/friends/requests', {
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const acceptRequest = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/friends/accept/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      });
      if (res.ok) {
        setRequests(requests.filter((r: any) => r._id !== id));
        setMessage('Friend request accepted');
      } else {
        const data = await res.json();
        setMessage('Failed: ' + data.message);
      }
    } catch (err: any) {
      setMessage('Failed to accept request');
    }
  };

  const rejectRequest = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/friends/reject/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      });
      if (res.ok) {
        setRequests(requests.filter((r: any) => r._id !== id));
        setMessage('Friend request rejected');
      } else {
        const data = await res.json();
        setMessage('Failed: ' + data.message);
      }
    } catch (err: any) {
      setMessage('Failed to reject request');
    }
  };

  if (!user) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Friends</h2>
      {message && <p className="mb-4 text-blue-600 bg-blue-50 p-2 rounded">{message}</p>}
      
      <div className="bg-white p-6 rounded shadow mb-10">
        <h3 className="text-xl font-bold mb-4">Friend Requests</h3>
        {requests.length === 0 ? (
          <p className="text-gray-500">No pending friend requests.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((reqUser: any) => (
              <div key={reqUser._id} className="flex flex-col bg-gray-50 p-4 rounded border border-gray-200">
                <Link href={`/user/${reqUser._id}`} className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
                    {reqUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-lg hover:underline">{reqUser.name}</span>
                  </div>
                </Link>
                <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={() => acceptRequest(reqUser._id)} 
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium transition-colors"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => rejectRequest(reqUser._id)}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
