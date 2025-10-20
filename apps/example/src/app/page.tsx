"use client";

import { useState } from "react";

// Simplified version without problematic dependencies
export default function Home() {
  const [text, setText] = useState<string>("");

  const handleSubmit = () => {
    console.log("Submit:", text);
    setText("");
  };

  return (
    <div className="container">
      <h1 className="title">AI Burn Rate Analyzer</h1>
      <div className="form-container">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="textarea"
          placeholder="Ask about burn rate analysis..."
          rows={4}
        />
        <button
          onClick={handleSubmit}
          className="button"
        >
          Submit
        </button>
      </div>
    </div>
  );
}