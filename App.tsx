
import React, { useState, useEffect, useRef } from 'react';
import { Message, MessageType, MessageStatus, User, USER_A, USER_B } from './types';
import { storageService } from './services/storage';
import { getGeminiReply } from './services/gemini';
import ChatBubble from './components/ChatBubble';

const COUNTRIES = [
  { code: '+1', name: 'USA', flag: '🇺🇸' },
  { code: '+977', name: 'Nepal', flag: '🇳🇵' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+971', name: 'UAE', flag: '🇦🇪' },
  { code: '+974', name: 'Qatar', flag: '🇶🇦' },
  { code: '+965', name: 'Kuwait', flag: '🇰🇼' },
  { code: '+44', name: 'UK', flag: '🇬🇧' },
  { code: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬' }
];

const App: React.FC = () => {
  const [userProfileMap, setUserProfileMap] = useState<{ [key: string]: User }>({
    [USER_A.id]: USER_A,
    [USER_B.id]: USER_B
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>(USER_A.id);
  const [inputText, setInputText] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  
  // Phone Edit States
  const [tempCountry, setTempCountry] = useState(COUNTRIES[0].code);
  const [tempNumber, setTempNumber] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = userProfileMap[currentUserId];
  const otherUserId = currentUserId === USER_A.id ? USER_B.id : USER_A.id;
  const otherUser = userProfileMap[otherUserId];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const savedUsers = storageService.getUsers({
      [USER_A.id]: USER_A,
      [USER_B.id]: USER_B
    });
    setUserProfileMap(savedUsers);
    setMessages(storageService.getMessages());
    
    const handleConnectivityChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleConnectivityChange);
    window.addEventListener('offline', handleConnectivityChange);

    return () => {
      window.removeEventListener('online', handleConnectivityChange);
      window.removeEventListener('offline', handleConnectivityChange);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSavePhone = () => {
    const fullNumber = `${tempCountry} ${tempNumber.trim()}`;
    const updatedUser = { ...currentUser, phone: fullNumber };
    const newMap = { ...userProfileMap, [currentUserId]: updatedUser };
    
    setUserProfileMap(newMap);
    storageService.saveUser(updatedUser);
    setIsEditingPhone(false);
  };

  const handleSendMessage = async (text: string = inputText, type: MessageType = MessageType.TEXT, mediaProps: Partial<Message> = {}) => {
    if (!text.trim() && type === MessageType.TEXT) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      receiverId: otherUserId,
      content: text,
      timestamp: Date.now(),
      type: type,
      status: isOnline ? MessageStatus.SENT : MessageStatus.PENDING,
      ...mediaProps
    };

    storageService.addMessage(newMessage);
    setMessages(storageService.getMessages());
    setInputText('');

    if (isOnline && type === MessageType.TEXT) {
      setIsTyping(true);
      const reply = await getGeminiReply(text);
      setIsTyping(false);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        senderId: otherUserId,
        receiverId: currentUserId,
        content: reply,
        timestamp: Date.now(),
        type: MessageType.TEXT,
        status: MessageStatus.SENT
      };

      storageService.addMessage(botMessage);
      setMessages(storageService.getMessages());
    }
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''} h-screen w-full flex items-center justify-center bg-gray-200 dark:bg-black p-0 md:p-4`}>
      <div className="flex flex-col h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl md:rounded-3xl overflow-hidden relative font-sans">
        
        {/* Profile Sidebar */}
        {showProfile && (
          <div className="absolute inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col animate-in slide-in-from-left duration-300">
            <header className="p-4 flex items-center bg-emerald-600 text-white shrink-0">
              <button onClick={() => { setShowProfile(false); setIsEditingPhone(false); }} className="mr-4 text-xl">
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <h2 className="font-bold text-lg">My Profile</h2>
            </header>
            <div className="flex flex-col items-center p-8 border-b dark:border-gray-800">
              <div className="relative group">
                <img src={currentUser.avatar} className="w-32 h-32 rounded-full mb-4 shadow-lg border-4 border-emerald-50" alt="Profile" />
                <div className="absolute bottom-6 right-0 bg-emerald-500 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-600">
                  <i className="fa-solid fa-camera"></i>
                </div>
              </div>
              <h3 className="text-xl font-bold dark:text-white">{currentUser.name}</h3>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Phone Section */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl shadow-inner">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Mobile Number</label>
                  {!isEditingPhone && (
                    <button onClick={() => {
                      setIsEditingPhone(true);
                      const parts = currentUser.phone.split(' ');
                      const foundCountry = COUNTRIES.find(c => c.code === parts[0]);
                      setTempCountry(foundCountry ? foundCountry.code : COUNTRIES[0].code);
                      setTempNumber(parts.length > 1 ? parts.slice(1).join('') : parts[0]);
                    }} className="text-emerald-500 text-xs hover:underline">Edit</button>
                  )}
                </div>
                
                {isEditingPhone ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex space-x-2">
                      <select 
                        value={tempCountry}
                        onChange={(e) => setTempCountry(e.target.value)}
                        className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-2 text-sm dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                      >
                        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                      </select>
                      <input 
                        type="tel"
                        value={tempNumber}
                        onChange={(e) => setTempNumber(e.target.value)}
                        placeholder="Number"
                        className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={handleSavePhone} className="flex-1 bg-emerald-500 text-white py-2 rounded-lg text-xs font-bold shadow-md hover:bg-emerald-600 transition-colors">Save</button>
                      <button onClick={() => setIsEditingPhone(false)} className="px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded-lg text-xs font-bold">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="dark:text-gray-200 text-lg font-medium">{currentUser.phone}</p>
                )}
              </div>

              {/* Status Section */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                <label className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">About</label>
                <p className="dark:text-gray-300 mt-1">{currentUser.status}</p>
              </div>

              {/* Appearance */}
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <i className={`fa-solid ${isDarkMode ? 'fa-moon text-blue-400' : 'fa-sun text-amber-500'}`}></i>
                  </div>
                  <span className="dark:text-gray-200 text-sm font-medium">Dark Appearance</span>
                </div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-emerald-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Header */}
        <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-3 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setShowProfile(true)}>
            <div className="relative">
              <img src={otherUser.avatar} className="w-10 h-10 rounded-full border border-gray-100 dark:border-gray-700 transition-transform group-hover:scale-105" alt="avatar" />
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
            <div>
              <h1 className="font-bold text-gray-800 dark:text-gray-100 text-sm leading-tight">{otherUser.name}</h1>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-tight">
                {otherUser.phone}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentUserId(otherUserId)} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-emerald-500 transition-all active:scale-90"
              title="Switch User Identity"
            >
              <i className="fa-solid fa-user-group text-sm"></i>
            </button>
            <div className={`px-2 py-0.5 rounded text-[9px] font-bold ${isOnline ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'}`}>
              {isOnline ? 'SYNCING' : 'OFFLINE'}
            </div>
          </div>
        </header>

        {/* Messages Body */}
        <main className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#efeae2] dark:bg-gray-950 relative">
          <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]"></div>
          
          <div className="flex justify-center mb-6">
            <span className="bg-gray-300/40 dark:bg-white/5 backdrop-blur-md px-3 py-1 rounded-full text-[9px] text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest border border-white/20">
              End-to-End Encrypted
            </span>
          </div>

          {messages.map((msg) => (
            <ChatBubble 
              key={msg.id} 
              message={msg} 
              isOwn={msg.senderId === currentUserId} 
            />
          ))}
          
          {isTyping && (
            <div className="flex justify-start mb-4">
               <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 flex space-x-1 items-center shadow-sm">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
               </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </main>

        {/* Footer / Input */}
        <footer className="p-3 bg-[#f0f2f5] dark:bg-gray-800 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-white dark:bg-gray-700 rounded-2xl flex items-center px-3 py-1 shadow-sm border border-transparent focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
              <button className="text-gray-400 p-1 hover:text-emerald-500 transition-colors">
                <i className="fa-regular fa-face-smile text-xl"></i>
              </button>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                placeholder="Message"
                className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-white px-2 py-2 text-[15px] resize-none max-h-24 scrollbar-hide"
                rows={1}
              />
              <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 p-1 hover:text-emerald-500 rotate-45 transition-colors">
                <i className="fa-solid fa-paperclip text-lg"></i>
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => handleSendMessage(file.name, MessageType.FILE, { mediaUrl: reader.result as string, fileName: file.name });
                  reader.readAsDataURL(file);
                }
              }} />
            </div>

            <button 
              onClick={() => handleSendMessage()}
              className="w-11 h-11 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-all hover:bg-emerald-600"
            >
              {inputText.trim() ? <i className="fa-solid fa-paper-plane text-lg ml-0.5"></i> : <i className="fa-solid fa-microphone text-lg"></i>}
            </button>
          </div>
          <div className="mt-2 flex justify-center text-[8px] dark:text-gray-500 uppercase tracking-tighter">
            Talking as: <span className="text-emerald-600 dark:text-emerald-400 ml-1 font-bold">{currentUser.name} ({currentUser.phone})</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
