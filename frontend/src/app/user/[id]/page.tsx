'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';
import PostItem from '@/components/PostItem';
import CreatePost from '@/components/CreatePost';
import Link from 'next/link';

export default function PublicProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const fetchProfileAndPosts = async () => {
    try {
      // Fetch Profile
      const profileRes = await fetch(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${Cookies.get('token')}` },
        cache: 'no-store'
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.relationship === 'self') {
          // Removed redirect to /profile, since this page now handles self
        }
        setProfile(profileData);
      } else {
        const errorData = await profileRes.json();
        setError(errorData.message || 'Failed to load profile');
      }

      // Fetch Posts
      const postsRes = await fetch(`http://localhost:5000/api/posts/user/${id}`, {
        headers: { Authorization: `Bearer ${Cookies.get('token')}` },
        cache: 'no-store'
      });
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) {
      fetchProfileAndPosts();

      const interval = setInterval(() => {
        fetchProfileAndPosts();
      }, 4000);

      const handleFocus = () => fetchProfileAndPosts();
      window.addEventListener('focus', handleFocus);

      return () => {
        clearInterval(interval);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [user, id]);

  const handleAddFriend = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/friends/request/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      });
      if (res.ok) {
        setProfile({ ...profile, relationship: 'pending_sent' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFollow = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/follow/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      });
      if (res.ok) {
        setProfile({ ...profile, isFollowing: !profile.isFollowing });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (file: File, type: 'avatar' | 'cover') => {
    try {
      const formData = new FormData();
      formData.append(type, file);
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${Cookies.get('token')}` },
        body: formData,
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setProfile({ ...profile, avatar: updatedUser.avatar, cover: updatedUser.cover });
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading image');
    }
  };

  const toggleLock = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users/profile/lock', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      });
      if (res.ok) {
        setProfile({ ...profile, isProfileLocked: !profile.isProfileLocked });
      } else {
        alert('Toggle lock failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto mt-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow mb-6">
        {/* Cover Photo */}
        <div className="h-64 bg-gray-300 w-full relative group rounded-t-lg overflow-hidden">
          {profile.cover && <img src={`http://localhost:5000${profile.cover}`} alt="Cover" className="w-full h-full object-cover" />}
          {profile.relationship === 'self' && (
            <>
              <div 
                className="absolute bottom-4 right-4 z-20 bg-white p-2 rounded-lg shadow cursor-pointer flex items-center gap-2 text-sm font-semibold hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  coverInputRef.current?.click();
                }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 0011.586 3H8.414a1 1 0 00-.707.293L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 110-6 3 3 0 010 6z"></path></svg>
                Chỉnh sửa ảnh bìa
              </div>
              <input type="file" className="hidden" accept="image/*" ref={coverInputRef} onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleImageUpload(e.target.files[0], 'cover');
                  e.target.value = '';
                }
              }} />
            </>
          )}
        </div>
        
        {/* Avatar and Info */}
        <div className="px-8 pb-6 flex flex-col md:flex-row md:items-end -mt-16 gap-4 relative z-10">
          <div className="w-32 h-32 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600 shadow-md relative group">
            {profile.avatar ? (
               <img src={`http://localhost:5000${profile.avatar}`} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
               <span>{profile.name.charAt(0).toUpperCase()}</span>
            )}
            
            {profile.relationship === 'self' && (
              <div 
                className="absolute bottom-0 right-0 bg-gray-200 p-2 rounded-full cursor-pointer hover:bg-gray-300 border-2 border-white shadow-sm"
                onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                title="Cập nhật ảnh đại diện"
              >
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20"><path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 0011.586 3H8.414a1 1 0 00-.707.293L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 110-6 3 3 0 010 6z"></path></svg>
              </div>
            )}
            
            {/* Avatar Dropdown Menu */}
            {showAvatarMenu && profile.relationship === 'self' && (
              <div className="absolute top-[105%] left-0 bg-white border rounded shadow-lg z-50 w-48 text-sm overflow-hidden text-gray-800">
                <button 
                  onClick={() => {
                    setShowAvatarMenu(false);
                    if (profile.avatar) setShowAvatarModal(true);
                  }} 
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center font-semibold"
                >
                  <svg className="w-5 h-5 mr-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                  Xem ảnh đại diện
                </button>
                <button 
                  onClick={() => {
                    setShowAvatarMenu(false);
                    avatarInputRef.current?.click();
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center font-semibold border-t"
                >
                  <svg className="w-5 h-5 mr-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path></svg>
                  Chọn ảnh đại diện
                </button>
              </div>
            )}
            <input type="file" className="hidden" accept="image/*" ref={avatarInputRef} onChange={e => {
              if (e.target.files && e.target.files[0]) {
                handleImageUpload(e.target.files[0], 'avatar');
                e.target.value = '';
              }
            }} />
          </div>
          
          <div className="flex-1 mt-4 md:mt-0 mb-2">
            <h1 className="text-3xl font-bold">{profile.name}</h1>
          </div>
          
          <div className="flex gap-2 mb-2">
            {profile.relationship === 'none' && (
              <button onClick={handleAddFriend} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z"></path><path d="M16 7h-1V6h-2v1h-1v2h1v1h2V9h1V7z"></path></svg>
                Thêm bạn bè
              </button>
            )}
            {profile.relationship === 'pending_sent' && (
              <button disabled className="flex items-center bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold cursor-not-allowed hover:bg-gray-300 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path></svg>
                Đã gửi lời mời
              </button>
            )}
            {profile.relationship === 'pending_received' && (
              <Link href="/friends" className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors">
                Phản hồi
              </Link>
            )}
            {profile.relationship === 'friends' && (
              <button disabled className="flex items-center bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold cursor-default hover:bg-gray-300 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16.707 6.707l-3.5 3.5a1 1 0 01-1.414 0l-1.5-1.5a1 1 0 011.414-1.414l.793.793 2.793-2.793a1 1 0 011.414 1.414z"></path></svg>
                Bạn bè
              </button>
            )}
            
            {/* Follow/Unfollow Button */}
            {profile.relationship !== 'self' && (
              <button 
                onClick={handleToggleFollow}
                className={`flex items-center px-4 py-2 rounded-md font-semibold transition-colors ${profile.isFollowing ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {profile.isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
              </button>
            )}
            
            {/* Lock/Unlock Profile Button */}
            {profile.relationship === 'self' && (
              <button 
                onClick={toggleLock}
                className={`flex items-center px-4 py-2 rounded-md font-semibold transition-colors ${profile.isProfileLocked ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
              >
                {profile.isProfileLocked ? 'Mở khóa trang' : 'Khóa trang'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Body */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Intro */}
        <div className="w-full md:w-1/3">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Intro</h3>
            <p className="text-gray-700 text-sm">{profile.bio}</p>
            {profile.isProfileLocked && profile.relationship !== 'friends' && (
              <p className="mt-4 text-red-500 text-sm font-semibold">🔒 Profile is locked</p>
            )}
          </div>
        </div>

        {/* Right Column - Posts */}
        <div className="w-full md:w-2/3">
          {profile.relationship === 'self' && (
            <div className="mb-6">
              <CreatePost onPostCreated={fetchProfileAndPosts} />
            </div>
          )}
          
          {posts.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
              No posts to show
            </div>
          ) : (
            posts.map(post => (
              <PostItem key={post._id} post={post} onUpdate={fetchProfileAndPosts} />
            ))
          )}
        </div>
      </div>

      {/* Avatar Modal */}
      {showAvatarModal && profile.avatar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={() => setShowAvatarModal(false)}>
          <div className="relative max-w-3xl max-h-[90vh] p-4 flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img src={`http://localhost:5000${profile.avatar}`} alt="Avatar Full" className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
            <button 
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-800 text-2xl font-bold transition-colors"
              onClick={() => setShowAvatarModal(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
