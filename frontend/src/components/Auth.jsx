import { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://community-dscc.onrender.com/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        onAuthSuccess(data);
      } else {
        setError(data.error || 'Oops! Something went wrong.');
      }
    } catch (err) {
      setError('Network snag! Please check your connection.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden">
      {/* Decorative Floating Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-200/50 rounded-full blur-3xl animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-100/50 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="w-full max-w-md glass-card rounded-[3rem] p-10 z-10 border-white/50 shadow-2xl shadow-sky-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 breezy-gradient rounded-3xl flex items-center justify-center text-white shadow-lg mb-4 animate-float">
            <Heart size={32} fill="white" />
          </div>
          <h2 className="text-4xl font-extrabold text-slate-800 text-center tracking-tight">
            {isLogin ? 'Hello Again!' : 'Welcome Home'}
          </h2>
          <p className="text-slate-400 text-center mt-2 font-medium">
            {isLogin ? 'We missed your happy face!' : 'Join our joyful community today.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-2xl text-sm border border-red-100 flex items-center gap-2">
            <Sparkles size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="group">
              <input
                type="text"
                placeholder="Pick a happy username"
                className="w-full p-4 bg-white/50 border border-white rounded-2xl focus:ring-4 focus:ring-sky-100 outline-none transition-all placeholder:text-slate-300"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
          )}
          <input
            type="email"
            placeholder="Your email address"
            className="w-full p-4 bg-white/50 border border-white rounded-2xl focus:ring-4 focus:ring-sky-100 outline-none transition-all placeholder:text-slate-300"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="A secret password"
            className="w-full p-4 bg-white/50 border border-white rounded-2xl focus:ring-4 focus:ring-sky-100 outline-none transition-all placeholder:text-slate-300"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button className="w-full py-4 breezy-gradient text-white rounded-2xl font-bold happy-button text-lg">
            {isLogin ? 'Let\'s Go!' : 'Sign Me Up!'}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-8 text-sky-600 font-bold text-sm hover:text-sky-700 transition-colors"
        >
          {isLogin ? "New here? Create an account" : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
}
