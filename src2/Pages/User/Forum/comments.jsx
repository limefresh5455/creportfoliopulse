import React, { useEffect, useState } from "react";
import { createComment, getCommentsByThread } from "../services/forumService";

export default function Comments({ clientId, threadId, userId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    (async () => {
      const data = await getCommentsByThread(clientId, threadId);
      setComments(data);
    })();
  }, [clientId, threadId]);

  const addComment = async () => {
    await createComment(clientId, threadId, text, userId);
    setText("");
    const updated = await getCommentsByThread(clientId, threadId);
    setComments(updated);
  };

  return (
    <>
      <div>
        {comments.map((c) => (
          <p key={c.id}>{c.text}</p>
        ))}
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
      />

      <button onClick={addComment}>Post</button>
    </>
  );
}
