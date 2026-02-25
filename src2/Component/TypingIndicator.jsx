import React from "react";

const TypingIndicator = () => {
  return (
    <div className="mb-2 small text-start">
      <div className="d-inline-block px-3 py-2 rounded bg-light border">
        <div className="d-flex align-items-center">
          <div className="typing-dots me-2">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
          <span className="text-muted">Portfolio Pulse is Working...</span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
