import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Send, Users, User, Plus, MessageSquare, Sparkles, Heart, Lock, ShieldCheck } from 'lucide-react';
import CryptoJS from 'crypto-js';

export default function Chat({ currentUser }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [groups, setGroups] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null); 
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  
  const scrollRef = useRef();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://community-dscc.onrender.com/api';
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://community-dscc.onrender.com';
  const E2EE_SECRET = 'joynet-super-secret-v1'; // In a real app, this would be a per-room derived key

  const encrypt = (text, key) => {
    return CryptoJS.AES.encrypt(text, key + E2EE_SECRET).toString();
  };

  const decrypt = (cipherText, key) => {
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, key + E2EE_SECRET);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      return "[Encrypted Message]";
    }
  };

  const getChatKey = () => {
    if (!selectedChat) return '';
    if (selectedChat.type === 'group') return selectedChat.id;
    return [currentUser.id, selectedChat.id].sort().join('-');
  };

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    newSocket.emit('join_private', currentUser.id);
    newSocket.on('receive_message', (message) => {
      const chatKey = selectedChat?.type === 'group' ? selectedChat.id : [currentUser.id, message.sender._id === currentUser.id ? message.recipient : message.sender._id].sort().join('-');
      // We handle decryption in the render for existing history and in state for new messages
      setMessages((prev) => [...prev, message]);
    });
    return () => newSocket.close();
  }, [currentUser.id]);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      if (selectedChat.type === 'group') {
        socket?.emit('join_group', selectedChat.id);
      }
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/groups`);
      const data = await res.json();
      setGroups(data);
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async () => {
    const res = await fetch(`${API_BASE_URL}/messages/group/${selectedChat.id}`);
    const data = await res.json();
    setMessages(data);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    
    const chatKey = getChatKey();
    const encryptedContent = encrypt(newMessage, chatKey);

    const messageData = {
      sender: currentUser.id,
      content: encryptedContent,
      isEncrypted: true,
      [selectedChat.type === 'group' ? 'group' : 'recipient']: selectedChat.id
    };
    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  const joinGroup = async (groupId) => {
    const res = await fetch(`${API_BASE_URL}/groups/${groupId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    });
    if (res.ok) fetchGroups();
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    const res = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newGroupName, adminId: currentUser.id })
    });
    if (res.ok) {
      setNewGroupName('');
      setShowCreateGroup(false);
      fetchGroups();
    }
  };

  return (
    <div className="flex h-[80vh] bg-white/40 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/50">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-white/20">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Chats</h2>
            <button 
              onClick={() => setShowCreateGroup(!showCreateGroup)}
              className="w-10 h-10 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center hover:bg-sky-200 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          {showCreateGroup && (
            <div className="flex gap-2 mb-4 animate-in fade-in slide-in-from-top-2">
              <input 
                type="text" 
                placeholder="New group name..."
                className="flex-1 p-3 text-sm bg-white border-none rounded-xl shadow-inner outline-none focus:ring-2 focus:ring-sky-300"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <button onClick={createGroup} className="px-4 py-2 breezy-gradient text-white text-xs font-bold rounded-xl">Add</button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-8">
          <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Community Rooms</div>
          {groups.map(group => {
            const isMember = group.members.includes(currentUser.id);
            return (
              <button
                key={group._id}
                onClick={() => setSelectedChat({ id: group._id, name: group.name, type: 'group', isMember })}
                className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all ${selectedChat?.id === group._id ? 'bg-white shadow-lg shadow-sky-100 scale-105' : 'hover:bg-white/40'} ${!isMember ? 'opacity-60' : ''}`}
              >
                <div className={`w-12 h-12 ${isMember ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400'} rounded-2xl flex items-center justify-center`}>
                  <Users size={24} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-700">{group.name}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider">{isMember ? 'Joined' : 'Available'}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white/60">
        {selectedChat ? (
          <>
            <div className="p-8 flex items-center justify-between bg-white/30 border-b border-white/50 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center shadow-md border-2 border-white">
                  <Users size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">{selectedChat.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      Community Room
                      <Lock size={10} className="text-teal-500" />
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 hover:text-pink-500 transition-colors">
                  <Heart size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {selectedChat.type === 'group' && !selectedChat.isMember ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/40 rounded-[3rem] border-4 border-dashed border-white/60">
                  <div className="w-20 h-20 bg-teal-100 rounded-[2rem] flex items-center justify-center text-teal-600 mb-6 shadow-xl shadow-teal-50">
                    <Sparkles size={40} />
                  </div>
                  <h4 className="text-3xl font-black text-slate-800 tracking-tight">Join the Fun!</h4>
                  <p className="text-slate-500 max-w-sm mt-4 mb-8 text-lg leading-relaxed">
                    This joyful group is waiting for you! Join now to see the chat and share your energy.
                  </p>
                  <button 
                    onClick={() => {
                      joinGroup(selectedChat.id);
                      setSelectedChat({ ...selectedChat, isMember: true });
                    }}
                    className="px-12 py-4 breezy-gradient text-white rounded-2xl font-black text-lg happy-button"
                  >
                    Join This Room
                  </button>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => {
                    const isOwn = msg.sender._id === currentUser.id;
                    return (
                      <div key={i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className="flex flex-col gap-1.5 max-w-[70%]">
                          {!isOwn && (
                            <span className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">{msg.sender.username}</span>
                          )}
                          <div className={`p-4 rounded-[1.5rem] shadow-sm relative group ${
                            isOwn 
                              ? 'breezy-gradient text-white rounded-tr-none' 
                              : 'bg-white text-slate-700 rounded-tl-none border border-white'
                          }`}>
                            <p className="text-sm font-medium leading-relaxed">
                              {decrypt(msg.content, getChatKey())}
                            </p>
                            <div className="flex justify-between items-center mt-2 opacity-60">
                                <Lock size={8} className="text-white" />
                                <div className={`text-[9px] font-bold uppercase tracking-wider text-right`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </>
              )}
            </div>

            {(selectedChat.type === 'private' || selectedChat.isMember) && (
              <form onSubmit={handleSendMessage} className="p-8 bg-white/30 backdrop-blur-md border-t border-white/50 flex gap-4">
                <input
                  type="text"
                  placeholder={`Send a happy message to ${selectedChat.name}...`}
                  className="flex-1 p-5 bg-white border-none rounded-[1.5rem] shadow-xl shadow-slate-100 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="w-16 h-16 breezy-gradient text-white rounded-2xl flex items-center justify-center happy-button shadow-xl shadow-sky-100">
                  <Send size={28} />
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12">
            <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mb-8 animate-float">
              <MessageSquare size={56} className="text-sky-100" fill="currentColor" />
            </div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">Your Happy Place</h3>
            <p className="text-slate-400 text-center max-w-sm mt-4 text-lg font-medium leading-relaxed">
              Select a friend or a community group to start spreading some joy!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
