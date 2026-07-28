'use client';
import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import CreatePost from '@/components/CreatePost';
import PostItem from '@/components/PostItem';

export default function Home() {
  const [posts, setPosts] = useState([]);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/posts/newsfeed', {
        headers: { Authorization: `Bearer ${Cookies.get('token')}` },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchPosts();

    // Auto-revalidate / polling every 4 seconds
    const interval = setInterval(() => {
      fetchPosts();
    }, 4000);

    // Auto-revalidate on window focus
    const handleFocus = () => fetchPosts();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchPosts]);

  return (
    <div className="max-w-2xl mx-auto mt-6 px-4">
      <CreatePost onPostCreated={fetchPosts} />
      <div>
        {posts.map((post: any) => (
          <PostItem key={post._id} post={post} onUpdate={fetchPosts} />
        ))}
        {posts.length === 0 && <p className="text-center text-gray-500 mt-10">No posts to show.</p>}
      </div>
    </div>
  );
}
