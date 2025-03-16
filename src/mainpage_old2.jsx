import React, { useState } from "react";
import axios from "axios";

const HuggingFaceInference = () => {
  // State to store user input
  const [inputText, setInputText] = useState("");
  // State to store predicted class label
  const [predictedLabel, setPredictedLabel] = useState(null);
  // State to show loading state
  const [loading, setLoading] = useState(false);
  // State to store error messages
  const [error, setError] = useState(null);

  // API call function
  const fetchPrediction = async () => {
    setLoading(true);
    setError(null); // Reset errors before API call
    setPredictedLabel(null); // Clear previous result

    const API_URL = "https://api-inference.huggingface.co/models/nali24mai/bert_prompt_classifier";
    const headers = {
      Authorization: 'Bearer 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',
      "Content-Type": "application/json",
    };

    try {
      const response = await axios.post(API_URL, { inputs: inputText }, { headers });

      console.log("API Response:", response.data); // Debugging output

      // Check if response data is valid and has labels
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Extract the label with the highest score
        const highestScoreLabel = response.data.reduce((prev, current) =>
          prev.score > current.score ? prev : current
        ).label;

        setPredictedLabel(highestScoreLabel); // Update state with the label of highest score
      } else {
        throw new Error("Unexpected API response format.");
      }
    } catch (err) {
      console.error("Inference error:", err);
      setError("Failed to fetch classification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Text Classification</h2>
      
      {/* Input Box */}
      <textarea
        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter text to classify..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      {/* API Call Button */}
      <button
        className={`mt-4 w-full p-3 rounded text-white font-bold ${
          loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
        }`}
        onClick={fetchPrediction}
        disabled={loading}
      >
        {loading ? "Processing..." : "Classify Text"}
      </button>

      {/* Display Prediction Result */}
      {predictedLabel && (
        <p className="mt-4 text-lg font-semibold text-center">
          Predicted Class: <span className="text-blue-600">{predictedLabel}</span>
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-4 text-lg text-red-600 text-center">
          {error}
        </p>
      )}
    </div>
  );
};

export default HuggingFaceInference;