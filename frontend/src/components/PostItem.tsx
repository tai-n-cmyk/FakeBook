'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';

export default function PostItem({ post, onUpdate }: { post: any, onUpdate: () => void }) {
  const { user } = useAuth();
  
  const initialLikes = post.likes || [];
  const initialComments = post.comments || [];
  
  const [likes, setLikes] = useState<string[]>(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const [shareText, setShareText] = useState('');
  const [showShareInput, setShowShareInput] = useState(false);
  
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  const [editPrivacy, setEditPrivacy] = useState(post.privacy || 'public');

  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    setLikes(post.likes || []);
    setComments(post.comments || []);
    setEditContent(post.content || '');
    setEditPrivacy(post.privacy || 'public');
  }, [post]);

  const isLiked = user ? likes.includes(user._id) : false;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${post._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      });
      if (res.ok) {
        onUpdate();
      } else {
        alert('Failed to delete');
      }
    } catch (err) {
      alert('Error deleting post');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${post._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('token')}` 
        },
        body: JSON.stringify({ content: editContent, privacy: editPrivacy })
      });
      if (res.ok) {
        setIsEditing(false);
        onUpdate(); // Revalidate
      } else {
        alert('Failed to edit post');
      }
    } catch (err) {
      alert('Error editing post');
    }
  };

  const handleLike = async () => {
    if (!user) return;
    
    // Optimistic update
    const newLikes = isLiked 
      ? likes.filter(id => id !== user._id)
      : [...likes, user._id];
    setLikes(newLikes);

    try {
      const res = await fetch(`http://localhost:5000/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      });
      if (res.ok) {
        const updatedLikes = await res.json();
        setLikes(updatedLikes);
        onUpdate(); // Revalidate
      }
    } catch (err) {
      // Revert on error
      setLikes(likes);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    try {
      const res = await fetch(`http://localhost:5000/api/posts/${post._id}/comment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('token')}` 
        },
        body: JSON.stringify({ text: commentText })
      });
      if (res.ok) {
        const newComments = await res.json();
        setComments(newComments);
        setCommentText('');
        onUpdate(); // Revalidate
      }
    } catch (err) {
      alert('Error adding comment');
    }
  };

  const handleReply = async (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyText.trim() || !user) return;

    try {
      const res = await fetch(`http://localhost:5000/api/posts/${post._id}/comment/${commentId}/reply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('token')}` 
        },
        body: JSON.stringify({ text: replyText })
      });
      if (res.ok) {
        const newComments = await res.json();
        setComments(newComments);
        setReplyToId(null);
        setReplyText('');
        onUpdate(); // Revalidate
      }
    } catch (err) {
      alert('Error adding reply');
    }
  };

  const submitShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${post._id}/share`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('token')}` 
        },
        body: JSON.stringify({ content: shareText || 'Shared a post' })
      });
      if (res.ok) {
        alert('Post shared on your timeline!');
        setShowShareInput(false);
        setShareText('');
        onUpdate(); // Revalidate
      } else {
        const data = await res.json();
        alert('Failed to share: ' + data.message);
      }
    } catch (err) {
      alert('Error sharing post');
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4 relative">
      <div className="flex justify-between items-start mb-2">
        <div className="font-bold">
          {post.user?.name || 'Unknown'}
          {post.sharedFrom && <span className="text-gray-500 font-normal ml-2">shared a post</span>}
        </div>
        
        {/* Post Dropdown Menu */}
        {user && user._id === post.user?._id && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path></svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10">
                <button 
                  onClick={() => { setIsEditing(true); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 font-medium"
                >
                  Chỉnh sửa
                </button>
                <button 
                  onClick={() => { handleDelete(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 font-medium"
                >
                  Xóa bài
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mb-2 whitespace-pre-wrap">{post.content}</p>
      
      {post.images && post.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {post.images.map((img: string, idx: number) => (
            <img key={idx} src={`http://localhost:5000${img}`} alt="Post image" className="rounded w-full object-cover max-h-60" />
          ))}
        </div>
      )}

      {/* Fallback for deleted/private shared post */}
      {post.hasOwnProperty('sharedFrom') && post.sharedFrom === null && (
        <div className="border rounded p-4 mt-2 bg-gray-100 flex items-center justify-center text-gray-500 italic border-dashed">
          Bài viết này không còn hiển thị do bị giới hạn quyền riêng tư hoặc đã bị xóa.
        </div>
      )}

      {/* Render shared post if it exists */}
      {post.sharedFrom && typeof post.sharedFrom === 'object' && (
        <div className="border rounded p-3 mt-2 bg-gray-50">
          <div className="font-bold mb-1">{post.sharedFrom.user?.name || 'Unknown User'}</div>
          <p className="mb-2 whitespace-pre-wrap text-sm">{post.sharedFrom.content}</p>
          {post.sharedFrom.images && post.sharedFrom.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {post.sharedFrom.images.map((img: string, idx: number) => (
                <img key={idx} src={`http://localhost:5000${img}`} alt="Shared post image" className="rounded w-full object-cover max-h-48" />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between text-xs text-gray-500 mt-2 mb-4">
        <span>{new Date(post.createdAt).toLocaleString()}</span>
        <span>
          {post.privacy === 'public' && '🌍 Công khai'}
          {post.privacy === 'friends' && '👥 Bạn bè'}
          {post.privacy === 'only_me' && '🔒 Chỉ mình tôi'}
        </span>
      </div>
      
      {/* Interactions */}
      <div className="flex gap-4 border-t border-b py-2 mb-4">
        <button onClick={handleLike} className={`flex-1 font-semibold ${isLiked ? 'text-blue-600' : 'text-gray-600 hover:bg-gray-100'} rounded p-1`}>
          Thích ({likes.length})
        </button>
        <button onClick={() => { setShowComments(!showComments); setShowShareInput(false); }} className="flex-1 font-semibold text-gray-600 hover:bg-gray-100 rounded p-1">
          Bình luận ({comments.length})
        </button>
        <button 
          onClick={() => { setShowShareInput(!showShareInput); setShowComments(false); }} 
          disabled={(post.privacy === 'only_me' && user?._id !== post.user?._id) || user?._id === post.user?._id}
          className={`flex-1 font-semibold rounded p-1 ${((post.privacy === 'only_me' && user?._id !== post.user?._id) || user?._id === post.user?._id) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Chia sẻ ({post.shareCount || 0})
        </button>
      </div>

      {/* Share Section */}
      {showShareInput && (
        <div className="mb-4">
          <form onSubmit={submitShare} className="flex flex-col gap-2 bg-gray-50 p-3 rounded border">
            <h4 className="font-semibold text-sm">Chia sẻ bài viết</h4>
            <textarea 
              value={shareText} 
              onChange={e => setShareText(e.target.value)} 
              placeholder="Bạn đang nghĩ gì về bài viết này..." 
              className="w-full border p-2 rounded text-sm min-h-[60px]"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowShareInput(false)} className="text-gray-600 text-sm font-semibold hover:underline">Hủy</button>
              <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded text-sm font-bold hover:bg-blue-700">Chia sẻ ngay</button>
            </div>
          </form>
        </div>
      )}

      {/* Comments Section */}
      {showComments && (
        <div>
          <div className="space-y-4 mb-4">
            {comments.map((c: any, idx: number) => (
              <div key={idx} className="flex flex-col text-sm">
                <div className="bg-gray-100 p-2 rounded-lg self-start">
                  <span className="font-bold mr-2 block">{c.user?.name || 'User'}</span>
                  <span>{c.text}</span>
                </div>
                <div className="text-xs text-gray-500 font-semibold mt-1 ml-2 flex gap-3">
                  <button onClick={() => setReplyToId(replyToId === c._id ? null : c._id)} className="hover:underline text-gray-600">Phản hồi</button>
                  <span>{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                
                {/* Replies */}
                {c.replies && c.replies.length > 0 && (
                  <div className="mt-2 ml-8 space-y-2 border-l-2 border-gray-200 pl-3">
                    {c.replies.map((r: any, rIdx: number) => (
                      <div key={rIdx} className="flex flex-col text-sm">
                        <div className="bg-gray-100 p-2 rounded-lg self-start">
                          <span className="font-bold mr-2 block">{r.user?.name || 'User'}</span>
                          <span>{r.text}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 ml-2">
                          <span>{new Date(r.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Reply Input */}
                {replyToId === c._id && (
                  <form onSubmit={(e) => handleReply(e, c._id)} className="flex gap-2 mt-2 ml-8">
                    <input 
                      type="text" 
                      value={replyText} 
                      onChange={e => setReplyText(e.target.value)} 
                      placeholder="Viết câu trả lời..." 
                      className="flex-1 border p-1 px-3 rounded-full text-sm bg-gray-50"
                      autoFocus
                    />
                    <button type="submit" className="text-blue-600 font-bold text-sm px-2">Gửi</button>
                  </form>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={handleComment} className="flex gap-2">
            <input 
              type="text" 
              value={commentText} 
              onChange={e => setCommentText(e.target.value)} 
              placeholder="Viết bình luận..." 
              className="flex-1 border p-2 px-4 rounded-full text-sm bg-gray-50"
            />
            <button type="submit" className="text-blue-600 font-bold text-sm px-2">Gửi</button>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[500px] rounded-xl shadow-2xl border border-gray-300 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <div className="w-9 h-9"></div>
              <h2 className="text-xl font-bold">Chỉnh sửa bài viết</h2>
              <button 
                onClick={() => setIsEditing(false)} 
                className="w-9 h-9 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold transition-colors text-lg"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{user?.name}</div>
                  <select 
                    value={editPrivacy} 
                    onChange={(e) => setEditPrivacy(e.target.value)}
                    className="bg-gray-100 text-xs font-semibold px-2 py-1 rounded cursor-pointer outline-none mt-1"
                  >
                    <option value="public">🌍 Công khai</option>
                    <option value="friends">👥 Bạn bè</option>
                    <option value="only_me">🔒 Chỉ mình tôi</option>
                  </select>
                </div>
              </div>

              <textarea
                className="w-full text-lg outline-none resize-none placeholder-gray-500 mb-4 min-h-[120px]"
                placeholder="Bạn đang nghĩ gì?"
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
              ></textarea>

              <button 
                type="submit" 
                className="w-full py-2.5 rounded-lg font-bold text-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Lưu thay đổi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
