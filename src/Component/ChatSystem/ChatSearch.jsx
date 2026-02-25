import React, { useState, useMemo, useRef, useEffect } from "react";
import "./chatSearch.css";

export const ChatSearch = ({ messages, isOpen, onClose, onJumpToMessage }) => {
  const [query, setQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return messages.filter(
      (msg) =>
        (msg.content && msg.content.toLowerCase().includes(lowerQuery)) ||
        (msg.file_name && msg.file_name.toLowerCase().includes(lowerQuery)),
    );
  }, [messages, query]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [results]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
  };

  const handleJump = () => {
    if (results.length > 0) {
      const messageId = results[currentIndex].id;
      onJumpToMessage(messageId);
      onClose(); 
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-header">
          <h3 className="text-light">Search in conversation</h3>
          <button className="close-btn" onClick={onClose}>
            <i className="ri-close-line" />
          </button>
        </div>

        <div className="search-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type to search messages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <span className="results-count">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {results.length > 0 && (
          <div className="search-results">
            <div className="results-navigation">
              <button onClick={handlePrevious} disabled={results.length === 0}>
                <i className="ri-arrow-up-s-line" />
              </button>
              <span>
                {currentIndex + 1} of {results.length}
              </span>
              <button onClick={handleNext} disabled={results.length === 0}>
                <i className="ri-arrow-down-s-line" />
              </button>
              <button className="jump-btn" onClick={handleJump}>
                Jump to message
              </button>
            </div>

            <div className="results-preview">
              {results.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={`result-item ${
                    idx === currentIndex ? "active" : ""
                  }`}
                  onClick={() => {
                    setCurrentIndex(idx);
                    onJumpToMessage(msg.id);
                    onClose();
                  }}
                >
                  <div className="result-sender">
                    {msg.sender_name || "User"}:
                  </div>
                  <div className="result-preview">
                    {msg.content || msg.file_name}
                  </div>
                  <div className="result-time">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {query && results.length === 0 && (
          <div className="no-results">No messages found</div>
        )}
      </div>
    </div>
  );
};
