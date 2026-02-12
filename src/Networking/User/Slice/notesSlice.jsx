import { createSlice } from "@reduxjs/toolkit";
import {
  createNoteApi,
  getNotesApi,
  getNoteByIdApi,
  updateNoteApi,
  deleteNoteApi,
} from "../APIs/Notes/notesApi";

const notesSlice = createSlice({
  name: "notesSlice",
  initialState: {
    notes: [],
    currentNote: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getNotesApi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotesApi.fulfilled, (state, action) => {
        state.loading = false;

        state.notes = Array.isArray(action.payload)
          ? action.payload
          : action.payload
          ? [action.payload]
          : [];
      })
      .addCase(getNotesApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch notes";
      });

    builder.addCase(createNoteApi.fulfilled, (state, action) => {
      const newNote = action.payload;
      if (newNote) {
        state.notes = [newNote, ...state.notes];
      }
    });

    builder.addCase(getNoteByIdApi.fulfilled, (state, action) => {
      state.currentNote = action.payload;
    });

    builder.addCase(updateNoteApi.fulfilled, (state, action) => {
      const updatedNote = action.payload;
      state.notes = state.notes.map((n) =>
        n.id === updatedNote.id ? updatedNote : n
      );
    });

    builder.addCase(deleteNoteApi.fulfilled, (state, action) => {
      const deletedId = action.payload.noteId;
      state.notes = state.notes.filter((n) => n.id !== deletedId);
    });
  },
});

export default notesSlice.reducer;
