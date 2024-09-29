// ./js/state.js

const state = {
    selectedNote: null,
    modalMode: 'create', // 'create', 'edit', or 'reply'
    editingNote: null,
    originalNoteText: '',
    originalNoteTags: [], // Added to store original tags when editing
    replyingToNote: null,
    replyingToNoteId: null,
    replyPreviewTextContent: '',
    tags: [] // Added to store tags in the modal
};

export { state };
