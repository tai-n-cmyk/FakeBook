'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:5000/api/users/search?name=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    // Option to navigate to full search page if needed, but they want direct interaction here
    // router.push(`/search?q=${searchQuery}`);
  };

  const [requestedUsers, setRequestedUsers] = useState<Record<string, boolean>>({});

  const sendRequest = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/friends/request/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSearchResults((prev: any) => prev.map((u: any) => u._id === id ? { ...u, relationship: 'pending_sent' } : u));
      } else {
        alert('Failed: ' + data.message);
      }
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
  };

  const isPublicRoute = ['/login', '/register', '/verify', '/forgot-password', '/reset-password'].includes(pathname);

  if (isPublicRoute) return null;

  return (
    <nav className="bg-blue-600 text-white p-3 shadow-md flex justify-between items-center relative">
      {/* Left: Logo */}
      <div className="text-2xl font-bold w-1/4">
        <Link href="/">FakeBook</Link>
      </div>

      {/* Center: Search Bar */}
      {user && (
        <div className="flex-1 max-w-md relative" ref={dropdownRef}>
          <form onSubmit={handleFormSubmit}>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                handleSearch(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search FakeBook..." 
              className="w-full rounded-full py-2 px-4 text-black bg-gray-100 outline-none focus:bg-white transition-colors"
            />
          </form>
          
          {/* Dropdown Results */}
          {showDropdown && searchQuery.trim() !== '' && (
            <div className="absolute top-12 left-0 w-full bg-white text-black shadow-lg rounded-lg p-2 z-50 max-h-96 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((resultUser: any) => (
                  <div 
                    key={resultUser._id} 
                    onClick={() => {
                      router.push(`/user/${resultUser._id}`);
                      setShowDropdown(false);
                    }}
                    className="flex justify-between items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">{resultUser.name}</span>
                      {resultUser.isProfileLocked && <span className="text-xs text-red-500">🔒 Profile Locked</span>}
                    </div>
                    {resultUser.relationship === 'none' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          sendRequest(resultUser._id);
                        }} 
                        className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-200 font-medium"
                      >
                        Thêm bạn bè
                      </button>
                    )}
                    {resultUser.relationship === 'pending_sent' && (
                      <span className="text-gray-500 text-sm font-medium mr-2">Đã gửi</span>
                    )}
                    {resultUser.relationship === 'pending_received' && (
                      <span className="text-gray-500 text-sm font-medium mr-2">Chờ phản hồi</span>
                    )}
                    {resultUser.relationship === 'friends' && (
                      <span className="text-gray-500 text-sm font-medium mr-2">Bạn bè</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-500 text-center text-sm">No results found for "{searchQuery}"</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex gap-4 items-center justify-end w-1/4">
        <Link href="/friends" className="font-semibold hover:bg-blue-700 px-3 py-2 rounded-full transition-colors flex items-center gap-1">
          <span>Friends</span>
        </Link>
        <Link href={user ? `/user/${user._id}` : "#"} className="font-semibold hover:bg-blue-700 px-3 py-2 rounded-full transition-colors">
          {user?.name || 'Profile'}
        </Link>
        {user && (
          <button onClick={logout} className="bg-blue-700 font-semibold px-4 py-2 rounded-full hover:bg-blue-800 transition-colors">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
