import { useState } from 'react';
import axios from 'axios';
import './PromptInput.css';

function PromptInput() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await axios.post('https://YOUR_AWS_API_URL', { prompt });
      setResponse(res.data.answer);
    } catch (error) {
      console.error(error);
      setResponse('Error generating response');
    }
  };

  return (
    <div className="prompt-container">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type your prompt here..."
      />
      <button onClick={handleSubmit}>Send</button>
      {response && (
        <div className="response">
          <h3>Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default PromptInput;