import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User as UserIcon, BookOpen, Search, Clock, Check, CheckCheck, MessageSquare, AlertCircle, Lock } from 'lucide-react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const Messages = () => {
    const { user } = useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showContacts, setShowContacts] = useState(false);
    
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        fetchContacts();
        
        // Polling for new messages every 5 seconds
        const interval = setInterval(() => {
            if (selectedChat) fetchMessages(selectedChat.id);
            fetchConversations();
        }, 5000);
        
        return () => clearInterval(interval);
    }, [selectedChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchConversations = async () => {
        try {
            const res = await api.get('/messages/conversations');
            setConversations(res.data);
            setIsLoading(false);
        } catch (err) {
            console.error("Failed to fetch conversations");
        }
    };

    const fetchContacts = async () => {
        try {
            const res = await api.get('/messages/contacts');
            setContacts(res.data);
        } catch (err) {
            console.error("Failed to fetch contacts");
        }
    };

    const fetchMessages = async (otherUserId) => {
        try {
            const res = await api.get(`/messages/history/${otherUserId}`);
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to fetch messages");
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        setIsSending(true);
        try {
            const res = await api.post('/messages/', {
                receiver_id: selectedChat.id,
                content: newMessage
            });
            setMessages([...messages, res.data]);
            setNewMessage('');
            fetchConversations();
        } catch (err) {
            console.error("Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    const selectConversation = (chat) => {
        setSelectedChat(chat);
        fetchMessages(chat.id);
        setShowContacts(false);
    };

    const formatTime = (ts) => {
        if (!ts) return "";
        const date = new Date(ts);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const filteredContacts = contacts.filter(c => 
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredConversations = conversations.filter(c => 
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 h-[calc(100vh-120px)] flex flex-col">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex-1 flex border border-slate-100">
                
                {/* Conversations Sidebar */}
                <div className="w-full md:w-80 flex flex-col border-r border-slate-100 bg-slate-50/30">
                    <div className="p-6 border-b border-slate-100 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-indigo-600" />
                                Messages
                            </h2>
                            <button 
                                onClick={() => setShowContacts(!showContacts)}
                                className={`p-2 rounded-xl transition-all ${showContacts ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                <Search className="h-4 w-4" />
                            </button>
                        </div>
                        
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder={showContacts ? "Search contacts..." : "Search chats..."}
                                className="w-full bg-slate-100 border-none rounded-2xl pl-10 pr-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-1">
                        {showContacts ? (
                            <>
                                <p className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">Available Contacts</p>
                                {filteredContacts.map(contact => (
                                    <button 
                                        key={contact.id}
                                        onClick={() => selectConversation(contact)}
                                        className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white hover:shadow-sm transition-all text-left group"
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black">
                                            {contact.role === 'faculty' ? <BookOpen className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-800 text-sm truncate">{contact.first_name} {contact.last_name}</p>
                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-tight">{contact.role}</p>
                                        </div>
                                    </button>
                                ))}
                                {filteredContacts.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-sm font-bold text-slate-400">No contacts found</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {filteredConversations.map(chat => (
                                    <button 
                                        key={chat.id}
                                        onClick={() => selectConversation(chat)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left relative group ${selectedChat?.id === chat.id ? 'bg-white shadow-md shadow-indigo-100/50 border-indigo-50' : 'hover:bg-white hover:shadow-sm'}`}
                                    >
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black transition-colors ${selectedChat?.id === chat.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {chat.role === 'faculty' ? <BookOpen className="h-6 w-6" /> : <UserIcon className="h-6 w-6" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <p className={`font-black text-sm truncate ${selectedChat?.id === chat.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                                                    {chat.first_name} {chat.last_name}
                                                </p>
                                                <span className="text-[10px] font-bold text-slate-400">{formatTime(chat.last_message_time)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs font-medium text-slate-500 truncate pr-4">
                                                    {chat.last_message || "No messages yet"}
                                                </p>
                                                {chat.unread_count > 0 && (
                                                    <span className="h-5 w-5 bg-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-indigo-100">
                                                        {chat.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                                {filteredConversations.length === 0 && (
                                    <div className="text-center py-12 px-6">
                                        <div className="bg-slate-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <MessageSquare className="h-8 w-8 text-slate-300" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-500">Your chat list is empty.</p>
                                        <button 
                                            onClick={() => setShowContacts(true)}
                                            className="mt-3 text-xs font-black text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
                                        >
                                            Start a conversation
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    {selectedChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                        {selectedChat.role === 'faculty' ? <BookOpen className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 leading-none">{selectedChat.first_name} {selectedChat.last_name}</h3>
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">{selectedChat.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Live Chat Active</span>
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                        <div className="h-16 w-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4">
                                            <MessageSquare className="h-8 w-8 text-slate-100" />
                                        </div>
                                        <p className="font-bold text-sm">Say hello to start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        if (!msg) return null;
                                        const isMine = Number(msg.sender_id) === Number(user?.id);
                                        return (
                                            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[75%] space-y-1`}>
                                                    <div className={`px-4 py-2.5 rounded-2xl text-sm font-semibold shadow-sm ${
                                                        isMine 
                                                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                                                            : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                                                    }`}>
                                                        {msg.content}
                                                    </div>
                                                    <div className={`flex items-center gap-1 px-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                        <span className="text-[9px] font-bold text-slate-400">{formatTime(msg.timestamp)}</span>
                                                        {isMine && (
                                                            msg.is_read ? <CheckCheck className="h-3 w-3 text-indigo-500" /> : <Check className="h-3 w-3 text-slate-300" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-4 px-6 border-t border-slate-100 bg-white">
                                <form onSubmit={handleSendMessage} className="flex gap-3">
                                    <input 
                                        type="text"
                                        placeholder="Type your message here..."
                                        className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-3.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        disabled={isSending}
                                    />
                                    <button 
                                        type="submit"
                                        disabled={isSending || !newMessage.trim()}
                                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 transition-all transform active:scale-95"
                                    >
                                        <Send className="h-5 w-5" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50/30">
                            <div className="h-24 w-24 bg-white rounded-[40px] shadow-2xl flex items-center justify-center mb-8 transform -rotate-6">
                                <MessageSquare className="h-12 w-12 text-indigo-100" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Your Conversations</h3>
                            <p className="text-slate-500 font-medium max-w-xs mx-auto">
                                Select someone from the sidebar to start a real-time live chat session.
                            </p>
                            <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-sm">
                                <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
                                    <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                                        <Clock className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Live Now</span>
                                </div>
                                <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
                                    <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                                        <Lock className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Fully Secure</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">EduSphere Real-time Messaging &bull; Encrypted Communication</p>
            </div>
        </div>
    );
};

export default Messages;
