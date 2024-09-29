// ./js/state.js

const state = {
    selectedNote: null,
    modalMode: 'create', // 'create', 'edit', or 'reply'
    editingNote: null,
    originalNoteText: '',
    originalNoteTags: [],
    replyingToNote: null,
    replyingToNoteId: null,
    replyPreviewTextContent: '',
    tags: [],
    // Added for selection mode
    selectionMode: false,
    selectedNotes: [],
    selectionAction: null, // 'select' or 'deselect'
    selectionDragActive: false // Flag to indicate if drag selection is active
};

export { state };
