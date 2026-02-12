import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAiChatHistoryApi,
  askAiQuestionApi,
} from "../../../Networking/User/APIs/ProjectManagement/projectManagement";
import ReactMarkdown from "react-markdown";

export const WorkLetterChat = ({ projectId }) => {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const chatEndRef = useRef(null);

  const { messages, loading, sending } = useSelector(
    (state) => state.workLetterChatSlice,
  );

  const [question, setQuestion] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState(null);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchAiChatHistoryApi({ projectId }));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingQuestion]);

  const handleSend = async () => {
    if (!question.trim() || sending) return;

    const q = question.trim();

    setPendingQuestion(q);
    setQuestion("");
    inputRef.current?.focus();

    try {
      await dispatch(
        askAiQuestionApi({
          projectId,
          question: q,
        }),
      ).unwrap();
    } finally {
      setPendingQuestion(null);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 h-100 d-flex flex-column">
      <div className="card-body border-bottom">
        <div className="fw-bold">Work Letter AI Assistant</div>
        <small className="text-muted">
          Ask questions about costs, responsibilities, timelines
        </small>
      </div>

      <div
        className="card-body flex-grow-1 overflow-auto"
        style={{ maxHeight: "420px" }}
      >
        {loading ? (
          <div className="placeholder-glow">
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-3">
                <span className="placeholder col-6 mb-2"></span>
                <span className="placeholder col-9"></span>
              </div>
            ))}
          </div>
        ) : messages.length === 0 && !pendingQuestion ? (
          <div className="text-center m-5 position-relative">
            <div
              className="watermark-text"
              style={{
                fontSize: "48px",
                fontWeight: "700",
                opacity: 0.08,
                letterSpacing: "2px",
                userSelect: "none",
                marginTop: "40px",
              }}
            >
              creportfoliopulse
            </div>
          </div>
        ) : (
          <div className="ai-messages">
            {messages.map((msg, index) => (
              <div key={index} className="ai-response-card mb-3">
                <div className="mb-1 text-muted small">You asked</div>
                <p className="fw-medium mb-2">{msg.question}</p>

                <div className="mb-1 text-muted small">AI response</div>
                <div className="bg-light rounded-3 p-3">
                  <ReactMarkdown>{msg.answer}</ReactMarkdown>
                </div>
              </div>
            ))}

            {pendingQuestion && (
              <div className="ai-response-card mb-3 opacity-75">
                <div className="mb-1 text-muted small">You asked</div>
                <p className="fw-medium mb-2">{pendingQuestion}</p>

                <div className="mb-1 text-muted small">AI response</div>
                <div className="bg-light rounded-3 p-3 d-flex align-items-center gap-2">
                  <i className="bi bi-stars text-secondary fs-5" />
                  <span className="text-muted small">Analyzing…</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      <div className="card-body border-top">
        <div className="d-flex gap-2">
          <input
            ref={inputRef}
            className="form-control"
            placeholder="Ask about costs, responsibilities, compliance..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={sending}
          />
          <button
            className="btn btn-secondary px-4"
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? (
              <>
                <i className="bi bi-send-fill" />
              </>
            ) : (
              <i className="bi bi-send-fill" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
