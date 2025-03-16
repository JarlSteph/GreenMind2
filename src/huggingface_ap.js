import axios from "axios";

// Hugging Face API details
const HF_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"; // Example: Change to your model
const HF_HEADERS = {
  Authorization: `Bearer YOUR_HUGGINGFACE_TOKEN`, // Replace with your actual token
  "Content-Type": "application/json",
};

/**
 * Classifies text using Hugging Face's API
 * @param {string} text - The text input to classify
 * @returns {Promise<number>} - Predicted class label (0, 1, or 2)
 */
export const classifyText = async (text) => {
  try {
    const response = await axios.post(
      HF_API_URL,
      { inputs: text }, // Ensure proper format
      { headers: HF_HEADERS }
    );

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const logits = response.data[0].logits; // Model confidence scores
      const predictedClass = logits.indexOf(Math.max(...logits)); // Highest confidence label
      return predictedClass;
    }
  } catch (error) {
    console.error("Error in Hugging Face classification:", error);
    return 1; // Default to medium model if error occurs
  }
};