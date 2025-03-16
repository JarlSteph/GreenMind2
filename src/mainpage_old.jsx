import React, { useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import axios from 'axios'; // might be old, could do here
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";


export default function Chatbot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');
      // Here you would normally call your API or backend
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-green-100 bg-opacity-50 p-4">
      <div className="w-full max-w-lg bg-white bg-opacity-80 backdrop-blur-md shadow-xl rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-green-700 mb-4 text-center">GreenAI Chat</h1>
        <div className="h-72 overflow-y-auto mb-4 space-y-2">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`rounded-xl px-4 py-2 max-w-[70%] ${
                  msg.sender === 'user'
                    ? 'bg-green-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex w-full">
          <input
            className="flex-grow border-2 border-green-400 rounded-l-xl px-4 py-2 outline-none w-full"
            type="text"
            value={input}
            placeholder="Type your message..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            className="bg-green-500 hover:bg-green-600 text-white rounded-r-xl px-4 flex items-center justify-center"
            onClick={handleSend}>
            <SendHorizontal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}



const handleSend = async () => {
  if (input.trim()) {
    setMessages([...messages, { text: input, sender: 'user' }]);
    setInput('');
    try {
      const response = await axios.post(
        'https://<your-aws-endpoint>/api/chat',
        { message: input }
      );
      // handle the reply from your backend
      setMessages((prev) => [
        ...prev,
        { text: response.data.reply, sender: 'bot' }
      ]);
    } catch (error) {
      console.error(error);
    }
  }
};
