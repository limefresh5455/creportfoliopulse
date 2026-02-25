import React, { useState } from "react";
import { Card, Button, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import {
  createThread,
  get_Threads_Api,
} from "../../../Networking/Admin/APIs/forumApi";
import { toast } from "react-toastify";

export const CreateThread = ({ onClose }) => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please enter a thread title");
      return;
    }

    setLoading(true);
    try {
      await dispatch(createThread({ title })).unwrap();

      await dispatch(get_Threads_Api()).unwrap();

      toast.success("Thread Created!");
      setTitle("");

      if (onClose) onClose();
    } catch (error) {
      toast.error(error || "Failed to create thread");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Form.Group className="mb-3">
        <Form.Label>Thread Title</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter thread title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Form.Group>

      <Button
        variant="primary"
        className="w-100"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Creating..." : "+ Create Thread"}
      </Button>
    </div>
  );
};
