import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Chat from './components/Chat';
import { MessageSquare, Layout, LogOut, Heart, Sparkles, Send, MessageCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('feed'); 
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [commentInputs, setCommentInputs] = useState({});

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (res.ok) setError('');
      else setError('Backend is feeling a bit sleepy...');
    } catch (err) {
      setError('Cannot reach the joy-server. Is it running?');
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/posts`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
        setError('');
      }
    } catch (err) {
      console.error('Failed to fetch posts', err);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchPosts();
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        const parsed = JSON.parse(savedUser);
        // Ensure both id and _id are handled for backward compatibility
        if (parsed._id && !parsed.id) parsed.id = parsed._id;
        setUser(parsed);
    }
  }, []);

  const handleAuthSuccess = (data) => {
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, author: user?.username || 'Anonymous' }),
      });
      if (res.ok) {
        setContent('');
        fetchPosts();
      } else setError('Could not share your thought.');
    } catch (err) {
      setError('Network error. Check your connection!');
    } finally { setLoading(false); }
  };

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username })
      });
      if (res.ok) fetchPosts();
    } catch (err) { console.error('Error liking post', err); }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text?.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, author: user.username })
      });
      if (res.ok) {
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        fetchPosts();
      }
    } catch (err) { console.error('Error adding comment', err); }
  };

  if (!user) return <Auth onAuthSuccess={handleAuthSuccess} />;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Premium Navbar */}
      <nav className="glass-card sticky top-6 mx-6 rounded-3xl px-8 py-4 flex justify-between items-center z-50 border-white/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 breezy-gradient rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-sky-100 animate-float">J</div>
          <span className="font-black text-2xl text-slate-800 tracking-tight">JoyNet</span>
        </div>
        
        <div className="flex items-center gap-4 bg-white/50 p-1.5 rounded-2xl border border-white">
          <button 
            onClick={() => setView('feed')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.2rem] font-bold text-sm transition-all ${view === 'feed' ? 'breezy-gradient text-white shadow-md shadow-sky-100' : 'text-slate-400 hover:text-sky-500'}`}
          >
            <Layout size={18} />
            Feed
          </button>
          <button 
            onClick={() => setView('chat')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.2rem] font-bold text-sm transition-all ${view === 'chat' ? 'breezy-gradient text-white shadow-md shadow-sky-100' : 'text-slate-400 hover:text-sky-500'}`}
          >
            <MessageSquare size={18} />
            Chat
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <span className="font-black text-sm text-slate-700">{user.username}</span>
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Happy Soul</span>
          </div>
          <div className="w-12 h-12 rounded-2xl breezy-gradient text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white">
            {user.username ? user.username[0].toUpperCase() : 'U'}
          </div>
          <button onClick={handleLogout} className="w-10 h-10 bg-red-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {view === 'feed' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Post Feed */}
              <div className="lg:col-span-2 space-y-8">
                {error && (
                  <div className="p-4 bg-pink-50 text-pink-500 rounded-2xl border border-pink-100 font-bold text-sm flex items-center gap-2">
                    <Sparkles size={18} /> {error}
                  </div>
                )}

                <div className="glass-card rounded-[2.5rem] p-8 border-white/60">
                  <h2 className="text-2xl font-black mb-6 text-slate-800 tracking-tight">Share some happiness...</h2>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="What's making you smile today?"
                      className="w-full p-6 bg-white border-none rounded-3xl focus:ring-4 focus:ring-sky-50 outline-none min-h-[140px] resize-none shadow-inner placeholder:text-slate-300 font-medium"
                      required
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="self-end px-10 py-4 breezy-gradient text-white rounded-2xl font-black happy-button flex items-center gap-2"
                    >
                      {loading ? 'Sharing...' : 'Post Thought'} <Send size={18} />
                    </button>
                  </form>
                </div>

                <div className="space-y-6">
                  {posts.length === 0 ? (
                    <div className="text-center p-12 bg-white/20 rounded-[2.5rem] border border-white/40 italic text-slate-400 font-bold">
                      No happy thoughts yet. Be the first to start the ripple!
                    </div>
                  ) : (
                    posts.map((post) => (
                      <div key={post._id} className="glass-card rounded-[2.5rem] p-8 border-white/60 hover:scale-[1.01] transition-transform duration-300">
                        <p className="text-xl font-medium text-slate-700 leading-relaxed mb-6">{post.content}</p>
                        <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl breezy-gradient flex items-center justify-center text-[10px] text-white font-black">
                              {post.author?.[0] || 'A'}
                            </div>
                            <span className="font-black text-sm text-sky-500">@{post.author || 'Anonymous'}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        {post.aiRecommendation && (
                          <div className="mt-6 p-6 bg-sky-50/50 rounded-3xl border border-sky-100 text-sky-700 flex items-start gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                                <Sparkles size={20} className="text-sky-400" />
                            </div>
                            <p className="text-sm font-bold italic leading-relaxed">{post.aiRecommendation}</p>
                          </div>
                        )}

                        {/* Interaction Bar */}
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-6">
                           <button onClick={() => handleLike(post._id)} className="flex items-center gap-2 group transition-colors">
                              <Heart size={20} className={`transition-all ${post.likes?.includes(user.username) ? 'text-pink-500 fill-pink-500 scale-110' : 'text-slate-400 group-hover:text-pink-400'}`} />
                              <span className={`font-bold ${post.likes?.includes(user.username) ? 'text-pink-500' : 'text-slate-400'}`}>{post.likes?.length || 0}</span>
                           </button>
                           <div className="flex items-center gap-2 text-slate-400">
                              <MessageCircle size={20} />
                              <span className="font-bold">{post.comments?.length || 0}</span>
                           </div>
                        </div>

                        {/* Comments Section */}
                        <div className="mt-6 space-y-4">
                            {post.comments?.map((comment, idx) => (
                                <div key={idx} className="flex items-start gap-3 bg-white/40 p-4 rounded-2xl">
                                    <div className="w-6 h-6 rounded-lg breezy-gradient text-[8px] text-white font-black flex items-center justify-center shrink-0">
                                       {comment.author?.[0]?.toUpperCase() || 'A'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-black text-xs text-slate-700">{comment.author}</span>
                                            <span className="text-[9px] font-bold text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-600 mt-1">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                            <form onSubmit={(e) => handleAddComment(e, post._id)} className="flex items-center gap-3 mt-4">
                               <input 
                                  type="text" 
                                  placeholder="Add a happy comment..." 
                                  value={commentInputs[post._id] || ''}
                                  onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                                  className="flex-1 px-4 py-3 bg-white/60 border border-white rounded-xl focus:ring-2 focus:ring-sky-100 outline-none text-sm font-medium placeholder:text-slate-400"
                               />
                               <button type="submit" disabled={!commentInputs[post._id]?.trim()} className="p-3 bg-sky-50 text-sky-500 rounded-xl hover:bg-sky-100 disabled:opacity-50 transition-colors">
                                  <Send size={16} />
                               </button>
                            </form>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Mini Stats/Profile */}
              <div className="hidden lg:block space-y-8">
                <div className="glass-card rounded-[3rem] p-8 text-center border-white/60">
                   <div className="relative inline-block mb-6">
                     <div className="w-24 h-24 rounded-[2rem] breezy-gradient text-white flex items-center justify-center font-black text-4xl shadow-xl border-4 border-white">
                       {user.username ? user.username[0].toUpperCase() : 'U'}
                     </div>
                     <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-xl border-4 border-white flex items-center justify-center text-white">
                        <Heart size={14} fill="currentColor" />
                     </div>
                   </div>
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight">{user.username}</h3>
                   <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest">Community Member</p>
                   
                   <div className="grid grid-cols-2 gap-4 mt-8">
                      <div className="bg-white/50 p-4 rounded-2xl border border-white">
                        <div className="text-2xl font-black text-sky-500">{posts.filter(p => p.author === user.username).length}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Posts</div>
                      </div>
                      <div className="bg-white/50 p-4 rounded-2xl border border-white">
                        <div className="text-2xl font-black text-pink-500">{user.isCommunityMember ? 'YES' : 'NO'}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</div>
                      </div>
                   </div>
                </div>
                
                <div className="p-8 joy-gradient rounded-[2.5rem] text-white text-center shadow-xl shadow-pink-100">
                    <h4 className="font-black text-lg mb-2">Daily Joy Tip ☀️</h4>
                    <p className="text-sm font-bold opacity-90 leading-relaxed italic">
                      "Smiling for just 60 seconds can trick your brain into feeling happier!"
                    </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="pb-12 animate-in fade-in zoom-in-95 duration-500">
              <Chat currentUser={user} />
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-6 right-6 z-50">
          <button className="w-14 h-14 joy-gradient text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-pink-200 happy-button">
            <Sparkles size={24} />
          </button>
      </div>

      <div className="bg-white/80 border-t border-white/50 py-3 px-10 flex justify-between items-center backdrop-blur-md">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">JoyNet Secure Infrastructure</span>
        <div className="flex items-center gap-4">
           <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Connected to Heartbeat Server</span>
           <div className="w-2 h-2 bg-sky-400 rounded-full animate-ping"></div>
        </div>
      </div>
    </div>
  );
}

export default App;
