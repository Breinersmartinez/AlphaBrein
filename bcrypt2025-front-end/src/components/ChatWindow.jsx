import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Loader } from 'lucide-react';
import ChatService from '../services/ChatService';

const ChatWindow = ({ sessionId, onClose, sessionName }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Cargar historial de mensajes
  useEffect(() => {
    loadSessionHistory();
  }, [sessionId]);

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessionHistory = async () => {
    setIsFetchingHistory(true);
    setError('');
    try {
      const history = await ChatService.getSessionHistory(sessionId);
      setMessages(history || []);
    } catch (err) {
      setError('Error al cargar historial: ' + err.message);
      console.error(err);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    setIsLoading(true);
    setError('');

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    // Agregar mensaje del usuario optimísticamente
    setMessages(prev => [...prev, userMessage]);
    const inputText = inputValue;
    setInputValue('');

    try {
      const response = await ChatService.sendMessage(sessionId, inputText);
      
      // Agregar respuesta del AI
      const aiMessage = {
        id: Date.now() + 1,
        text: response.aiResponse || response.response || 'Error procesando respuesta',
        sender: 'ai',
        timestamp: response.timestamp,
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError('Error al enviar mensaje: ' + err.message);
      // Remover el mensaje del usuario si hay error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-black border-b border-gray-700 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">{sessionName || 'Chat'}</h2>
          <p className="text-sm text-gray-400">ID: {sessionId}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-white"
          title="Cerrar chat"
        >
          <X size={24} />
        </button>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {isFetchingHistory ? (
          <div className="flex justify-center items-center h-full">
            <Loader className="animate-spin text-blue-500" size={32} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-400">
            <p>No hay mensajes. ¡Comienza una conversación!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-800 text-gray-100 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900 border-l-4 border-red-500 text-red-100 p-4 mx-6">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="bg-black border-t border-gray-700 px-6 py-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder="Escribe tu mensaje..."
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            {isLoading ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;