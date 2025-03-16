import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { SendHorizontal } from "lucide-react";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

// ✅ Hugging Face API details
const HF_API_URL = "https://api-inference.huggingface.co/models/nali24mai/bert_prompt_classifier";
const HF_HEADERS = {
  Authorization: "Bearer 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",
  "Content-Type": "application/json",
};

// ✅ AWS Bedrock Client
const bedrockClient = new BedrockRuntimeClient({ 
  region: "us-west-2",
  credentials: {
    accessKeyId: "AKIAZ3G7G47H2X4KNIET",  
    secretAccessKey: "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",
  },
});

// ✅ Model Selection (Maps Classification Labels to Bedrock Model IDs)
const models = {
  0: "meta.llama3-1-8b-instruct-v1:0",   // Small model
  1: "meta.llama3-70b-instruct-v1:0",    // Medium model
  2: "meta.llama3-1-405b-instruct-v1:0", // Large model
};

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState(1); // Default: Medium Model
  const [complexityMessage, setComplexityMessage] = useState(""); // Message for UI
  const chatRef = useRef(null);
  const prevModelRef = useRef(1); // Track previous model complexity

  // ✅ Function to Classify Prompt using Hugging Face
  const classifyPrompt = async (text) => {
    try {
      const response = await axios.post(HF_API_URL, { inputs: text }, { headers: HF_HEADERS });

      if (Array.isArray(response.data) && response.data.length > 0 && Array.isArray(response.data[0])) {
        const predictions = response.data[0];
        const highestScoreLabel = predictions.reduce((prev, current) =>
          prev.score > current.score ? prev : current
        ).label;
        return parseInt(highestScoreLabel.replace("LABEL_", ""), 10);
      } else {
        throw new Error("Unexpected API response format.");
      }
    } catch (err) {
      console.error("Error in Hugging Face classification:", err);
      return 1; // Default to Medium Model if error occurs
    }
  };

  // ✅ Function to Call the Correct LLM (AWS Bedrock)
  const callLlamaModel = async (userPrompt, complexity) => {
    const selectedModelId = models[complexity] || models[1]; // Default to Medium
    const isComplexityReduced = complexity < prevModelRef.current;
    prevModelRef.current = complexity; // Store current complexity

    setSelectedModel(complexity); // Update selected model state

    // ✅ Show the complexity reduction message if complexity was reduced
    if (isComplexityReduced) {
      setComplexityMessage("Complexity reduced, 5x less CO2! 🍃");
      setTimeout(() => setComplexityMessage(""), 3000); // Remove after 3 sec
    }

    const request = {
      prompt: `Please give an answer to this question: ${userPrompt}`,
      max_gen_len: 512,
      temperature: 0.2,
      top_p: 0.7,
    };

    try {
      const response = await bedrockClient.send(
        new InvokeModelCommand({
          contentType: "application/json",
          body: JSON.stringify(request),
          modelId: selectedModelId,
        })
      );
      const nativeResponse = JSON.parse(new TextDecoder().decode(response.body));
      return nativeResponse.generation || "(No response)";
    } catch (error) {
      console.error("Error calling Llama 3 model:", error);
      return "(Error getting response)";
    }
  };

  // ✅ Handle User Input and Model Selection
  const handleSend = async () => {
    if (input.trim()) {
      setMessages((prev) => [...prev, { text: input, sender: "user" }]);
      setInput("");
      setIsTyping(true);

      const complexity = await classifyPrompt(input);
      console.log(`Selected Model Complexity: ${complexity}`);

      const llamaResponse = await callLlamaModel(input, complexity);

      setMessages((prev) => [
        ...prev,
        { text: llamaResponse, sender: "bot" },
      ]);

      setIsTyping(false);
    }
  };

  // ✅ Auto-scroll to latest message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-green-50 via-green-100 to-white items-center justify-center">
      <div className="relative w-full max-w-7xl bg-white bg-opacity-80 shadow-2xl backdrop-blur-lg rounded-3xl p-6 border border-green-200 flex flex-col h-[80vh]">

        {/* ✅ Complexity Reduction Message (Upper Left Corner) */}
        {complexityMessage && (
          <div className="absolute top-3 left-4 bg-green-200 text-green-800 px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-opacity duration-500">
            {complexityMessage}
          </div>
        )}

        {/* ✅ LOGO + TITLE (Hidden After First Message) */}
        <div className={`absolute top-1/3 left-1/2 transform -translate-x-1/2 flex items-center justify-center space-x-3 transition-opacity duration-700 ${messages.length ? "opacity-0" : "opacity-100"}`}>
          <img src="/src/assets/logo_plant.svg" alt="Plant Logo" className="w-24 h-24" />
          <h1 className="text-4xl font-bold text-[#9FCE63]" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            GreenMind
          </h1>
        </div>

        {/* CHAT MESSAGES */}
        <div className="flex-grow overflow-y-auto mt-20 p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx}>
              <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`rounded-2xl px-6 py-4 text-lg max-w-[80%] ${msg.sender === "user" ? "bg-[#9FCE63] text-green-900 rounded-br-none shadow-lg" : "bg-green-100 text-green-800 rounded-bl-none shadow-md"}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatRef} />
        </div>

        {/* BADGES ABOVE INPUT BAR */}
        <div className="flex justify-start space-x-2 mb-0">
          <div className={`px-3 py-1 rounded-lg text-gray-600 text-sm font-semibold shadow-sm border ${selectedModel === 0 ? "bg-gray-500 text-white" : "bg-gray-200 bg-opacity-50 border-dashed border-gray-400"}`}>
            Small
          </div>
          <div className={`px-3 py-1 rounded-lg text-gray-600 text-sm font-semibold shadow-sm border ${selectedModel === 1 ? "bg-gray-500 text-white" : "bg-gray-200 bg-opacity-50 border-dashed border-gray-400"}`}>
            Medium
          </div>
          <div className={`px-3 py-1 rounded-lg text-gray-600 text-sm font-semibold shadow-sm border ${selectedModel === 2 ? "bg-gray-500 text-white" : "bg-gray-200 bg-opacity-50 border-dashed border-gray-400"}`}>
            Large
          </div>
        </div>

        {/* ✅ Restored Input Field & Send Button */}
        <div className="flex items-center">
          <input
            type="text"
            className="input input-lg input-bordered w-full text-lg px-6 py-4 border-green-300 bg-white bg-opacity-90 shadow-md rounded-xl focus:ring-2 focus:ring-[#9FCE63] text-black"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
<button className="btn btn-lg ml-2 px-6 py-4 bg-[#9FCE63] hover:bg-green-600 text-white shadow-lg relative top-[-5px] border-white" onClick={handleSend}>            <SendHorizontal size={28} />
          </button>
        </div>

      </div>
    </div>
  );
}