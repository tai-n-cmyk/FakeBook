'use client';
import { useState, useRef } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from '@/context/AuthContext';

export default function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [privacy, setPrivacy] = useState('public');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content && (!images || images.length === 0)) return;

    const formData = new FormData();
    formData.append('content', content);
    formData.append('privacy', privacy);
    if (images) {
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }
    }

    try {
      const res = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${Cookies.get('token')}` },
        body: formData,
      });
      if (res.ok) {
        setContent('');
        setPrivacy('public');
        setImages(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsOpen(false);
        onPostCreated();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to create post');
      }
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Area */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex gap-3 items-center">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600 flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 text-left px-4 py-2.5 rounded-full transition-colors text-lg"
        >
          {user?.name?.split(' ')[0]} ơi, bạn đang nghĩ gì thế?
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[500px] rounded-xl shadow-2xl border border-gray-300 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <div className="w-9 h-9"></div> {/* Spacer for centering */}
              <h2 className="text-xl font-bold">Tạo bài viết</h2>
              <button 
                onClick={handleClose} 
                className="w-9 h-9 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold transition-colors text-lg"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{user?.name}</div>
                  <select 
                    value={privacy} 
                    onChange={(e) => setPrivacy(e.target.value)}
                    className="bg-gray-100 text-xs font-semibold px-2 py-1 rounded cursor-pointer outline-none mt-1"
                  >
                    <option value="public">🌍 Công khai</option>
                    <option value="friends">👥 Bạn bè</option>
                    <option value="only_me">🔒 Chỉ mình tôi</option>
                  </select>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                className="w-full text-2xl outline-none resize-none placeholder-gray-500 mb-4 min-h-[150px]"
                placeholder={`${user?.name?.split(' ')[0]} ơi, bạn đang nghĩ gì thế?`}
                value={content}
                onChange={e => setContent(e.target.value)}
              ></textarea>

              {/* Add to post section */}
              <div className="flex items-center justify-between border border-gray-300 rounded-lg p-3 mb-4 shadow-sm">
                <span className="font-semibold text-gray-800 ml-2">Thêm vào bài viết của bạn</span>
                <div className="flex gap-1 relative">
                   {/* Image Input hidden */}
                   <label className="cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors flex items-center justify-center">
                     <svg className="w-7 h-7 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 8l3-3 4 4h-7v-1zm5-7a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg>
                     <input
                       type="file"
                       multiple
                       accept="image/*"
                       ref={fileInputRef}
                       onChange={e => setImages(e.target.files)}
                       className="hidden"
                     />
                   </label>
                </div>
              </div>
              
              {/* Image preview indicator */}
              {images && images.length > 0 && (
                <div className="mb-4 relative">
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {Array.from(images).map((file, idx) => (
                      <div key={idx} className="relative group">
                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-32 object-cover rounded" />
                        <button 
                          type="button"
                          onClick={() => {
                            const dt = new DataTransfer();
                            Array.from(images).forEach((f, i) => { if(i !== idx) dt.items.add(f); });
                            setImages(dt.files.length > 0 ? dt.files : null);
                            if (dt.files.length === 0 && fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 hover:bg-opacity-100 text-white rounded-full w-6 h-6 flex items-center justify-center transition-all shadow-md"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-green-600 font-medium mt-2">
                    Đã chọn {images.length} ảnh/video
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={!content && (!images || images.length === 0)}
                className={`w-full py-2.5 rounded-lg font-bold text-lg transition-colors ${(!content && (!images || images.length === 0)) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                Đăng
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
