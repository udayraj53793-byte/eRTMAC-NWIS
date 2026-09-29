import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Send, MessageCircle, User, AlertCircle, BookOpen } from 'lucide-react';

const AIChat = ({ wellId, initialQuery }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m the eRTMAC-NWIS AI Drilling Copilot. I can help you analyze nearby well data, historical incidents, and risk patterns. Ask me about specific wells, formations, or drilling events.',
      sources: [],
      isAIGenerated: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (initialQuery && messages.length === 1) {
      setInput(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput('');

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: userMsg, wellId });
      const data = res.data.data;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
        isAIGenerated: data.isAIGenerated,
        disclaimer: data.disclaimer,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I encountered an error processing your request. Please check the connection and try again.',
        sources: [],
        isAIGenerated: false,
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQueries = [
    'Why is this interval considered risky?',
    'Which nearby wells had mud loss?',
    'What happened at 2850m?',
    'What mitigation was recorded?',
  ];

  return (
    <section className="ai-chat-shell flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 shadow-sm">
          <MessageCircle className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-700">Decision support</div>
          <div className="text-sm font-bold text-slate-800">AI Drilling Copilot</div>
          <div className="text-[11px] text-slate-500">Evidence-grounded · RAG-powered</div>
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ready
          </span>
        </div>
      </header>

      {/* Messages */}
      <div className="ai-chat-feed flex-1 space-y-5 overflow-y-auto bg-white p-5">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-1">
                {msg.isError ? <AlertCircle className="w-3.5 h-3.5 text-red-500" /> : <MessageCircle className="w-3.5 h-3.5 text-primary-600" />}
              </div>
            )}
            <div className={`max-w-[85%] space-y-2`}>
              <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-none'
                  : msg.isError
                    ? 'bg-red-50 text-red-700 border border-red-100 rounded-bl-none'
                    : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-bl-none'
              }`}>
                {msg.content}
              </div>

              {/* Sources */}
              {msg.sources?.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Sources:
                  </p>
                  {msg.sources.map((src, si) => (
                    <div key={si} className="text-xs bg-primary-50 border border-primary-100 rounded-lg px-3 py-2">
                      <div className="font-medium text-primary-700">
                        {src.well_name || src.wellName}
                        {src.page && ` · Page ${src.page}`}
                        {src.relevance && ` · Relevance: ${(src.relevance * 100).toFixed(0)}%`}
                      </div>
                      {src.text && <div className="text-slate-500 mt-0.5 truncate">{src.text.substring(0, 120)}...</div>}
                      {src.formation && <div className="text-slate-400">Formation: {src.formation}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* AI Disclaimer */}
              {msg.disclaimer && (
                <div className="text-xs text-slate-400 italic border-l-2 border-slate-200 pl-2">
                  {msg.disclaimer}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-3.5 h-3.5 text-slate-600" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-3.5 h-3.5 text-primary-600" />
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl rounded-bl-none px-4 py-3">
              <div className="flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-slate-400 ml-2">Searching knowledge base...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested queries */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-slate-400 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map(q => (
              <button key={q} onClick={() => sendMessage(q)} className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-full hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-100 bg-slate-50/70 p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about formations, historical events, risks..."
            aria-label="Ask the drilling copilot a question"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default AIChat;
