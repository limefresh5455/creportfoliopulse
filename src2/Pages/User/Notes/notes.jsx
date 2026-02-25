import React, { useEffect, useState } from "react";
import { Modal, Button, Form, FloatingLabel, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import {
  createNoteApi,
  getNotesApi,
  updateNoteApi,
  deleteNoteApi,
  deleteNoteFileApi,
} from "../../../Networking/User/APIs/Notes/notesApi";

export const Notes = () => {
  const dispatch = useDispatch();

  const { notes, loading } = useSelector((state) => state.notesSlice);

  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    noteId: null,
  });

  const [currentNote, setCurrentNote] = useState({
    id: null,
    title: "",
    content: "",
    file: null,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(getNotesApi());
  }, [dispatch]);

  const notesArray = Array.isArray(notes) ? notes : notes ? [notes] : [];

  const sortedNotes = [...notesArray].sort((a, b) => {
    const aTime = new Date(a.updated_at || a.created_at).getTime();
    const bTime = new Date(b.updated_at || b.created_at).getTime();
    return bTime - aTime;
  });

  console.log(sortedNotes, "sortedNotes");


  const openNewNote = () => {
    setIsEditing(false);
    setCurrentNote({
      id: null,
      title: "",
      content: "",
      file: null,
    });
    setShowModal(true);
  };


  const openEditNote = async (note) => {
    setIsEditing(true);
    setCurrentNote({
      id: note.id,
      title: note.title,
      content: note.content,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsEditing(false);
    setCurrentNote({ id: null, title: "", content: "" });
    setShowModal(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", currentNote.title?.trim() || "Untitled");
      formData.append("content", currentNote.content?.trim() || "");

        if (currentNote.file) {
        formData.append("file", currentNote.file);
      }

      if (isEditing && currentNote.id) {
        await dispatch(
          updateNoteApi({
            noteId: currentNote.id,
            data: formData,
          })
        ).unwrap();
      }
      else {
        await dispatch(createNoteApi(formData)).unwrap();
      }

      closeModal();
    } catch (err) {
      setError("Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  };


  const handleDelete = async (noteId) => {
    try {
      setDeleteLoading(noteId);
      await dispatch(deleteNoteApi(noteId)).unwrap();
    } catch (err) {
      alert("Failed to delete note");
    } finally {
      setDeleteLoading(null);
    }
  };

  function formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleString();     
  }

  return (
    <div>
      <div className="header-bg d-flex justify-content-between px-3 align-items-center sticky-header">
        <h5 className="mb-0 text-light mx-4">Notes</h5>
        <button className="btn btn-secondary btn-sm" onClick={openNewNote}>
          + New Note
        </button>
      </div>
      <div className="container-fuild p-3">
        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : sortedNotes.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <div style={{ fontSize: 40 }}>📝</div>
            <p className="mt-2">No notes yet</p>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={openNewNote}
            >
              + Add Note
            </button>
          </div>
        ) : (
          <div className="list-group">
            {sortedNotes.map((note) => (
              <div key={note.id} className="list-group-item list-group-item-action">
                <div className="d-flex flex-column flex-md-row w-100 justify-content-between">
                  <h6
                    className="mb-1"
                    style={{ cursor: "pointer" }}
                    onClick={() => openEditNote(note)}
                  >
                    {note.title?.length > 28 ? note.title.slice(0, 28) + "..." : note.title}
                  </h6>

                  <small className="text-muted">
                    {formatDate(note.updated_at || note.created_at)}
                  </small>
                </div>

                <p className="mb-1 text-truncate" onClick={() => openEditNote(note)}>
                  {note.content}
                </p>


                {note.files && note.files.length > 0 && (
                  <div className="mt-2">
                    {note.files.map((file) => (
                      <div
                        key={file.id}
                        className="d-flex justify-content-between align-items-center mb-1 p-2 border rounded"
                      >
                        <div className="text-truncate" style={{ maxWidth: "80%" }}>
                          <i className="bi bi-file-earmark-text me-2"></i>
                          {file.filename}
                        </div>
                        <div className="d-flex gap-2">

                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="bi bi-download"></i>
                          </a>


                          
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="d-flex gap-2 justify-content-end align-items-center mt-2">
                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                    onClick={() => openEditNote(note)}
                    style={{ border: 0, cursor: "pointer", fontSize: 18 }}
                  >
                    <i className="bi bi-pencil-square me-1"></i>
                  </button>

                  <div style={{ width: 22, textAlign: "center" }}>
                    {deleteLoading === note.id ? (
                      <div className="spinner-border spinner-border-sm text-danger"></div>
                    ) : (
                      <i
                        className="bi bi-trash text-danger"
                        style={{ cursor: "pointer", fontSize: 18 }}
                        onClick={() => setConfirmDelete({ show: true, noteId: note.id })}
                      ></i>
                    )}
                  </div>
                </div>
              </div>
            ))}

          </div>
        )}

        <Modal show={showModal} onHide={closeModal} backdrop="static" centered>
          <Form onSubmit={handleSave}>
            <Modal.Header closeButton={!saving}>
              <Modal.Title>{isEditing ? "Edit Note" : "Add Note"}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <FloatingLabel label="Title" className="mb-3">
                <Form.Control
                  type="text"
                  value={currentNote.title}
                  required
                  onChange={(e) =>
                    setCurrentNote((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </FloatingLabel>

              <FloatingLabel label="Note">
                <Form.Control
                  as="textarea"
                  style={{ height: "200px" }}
                  value={currentNote.content}
                  onChange={(e) =>
                    setCurrentNote((p) => ({ ...p, content: e.target.value }))
                  }
                />
              </FloatingLabel>
              {!isEditing && (
                <>
                  <Form.Label>Attach document</Form.Label>

                  <Form.Control
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                      setCurrentNote((p) => ({
                        ...p,
                        file: e.target.files[0],
                      }))
                    }
                  />
                </>
              )}

              {currentNote.file && (
                <small className="text-muted d-block mt-1">
                  Selected file: {currentNote.file.name}
                </small>
              )}

            

              <div className="mt-2 text-muted small">
                Tip: Only you can see your notes.
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? (
                  <>
                    <Spinner size="sm" /> Saving...
                  </>
                ) : isEditing ? (
                  "Save changes"
                ) : (
                  "Save"
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
        <Modal
          show={confirmDelete.show}
          onHide={() => setConfirmDelete({ show: false, noteId: null })}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>

          <Modal.Body>Are you sure you want to delete this note?</Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setConfirmDelete({ show: false, noteId: null })}
              disabled={deleteLoading === confirmDelete.noteId}
            >
              Cancel
            </Button>

            <Button
              variant="danger"
              onClick={async () => {
                await handleDelete(confirmDelete.noteId);
                setConfirmDelete({ show: false, noteId: null });
              }}
              disabled={deleteLoading === confirmDelete.noteId}
            >
              {deleteLoading === confirmDelete.noteId ? (
                <>
                  <Spinner size="sm" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};
