// ./js/state.js

const state = {
    selectedNote: null,
    modalMode: 'create', // 'create', 'edit', or 'reply'
    editingNote: null,
    originalNoteText: '',
    replyingToNote: null,
    replyingToNoteId: null,
    replyPreviewTextContent: ''
};

export { state };
