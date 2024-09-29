// ./js/modal.js

import { state } from './state.js';

const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const cancelBtn = document.getElementById('cancel-btn');
const confirmationModal = document.getElementById('confirmation-modal');
const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
const confirmDiscardBtn = document.getElementById('confirm-discard-btn');
const removeReplyModal = document.getElementById('remove-reply-modal');
const removeReplyCancelBtn = document.getElementById('remove-reply-cancel-btn');
const removeReplyConfirmBtn = document.getElementById('remove-reply-confirm-btn');
const noteInput = document.getElementById('note-input');
const replyPreview = document.getElementById('reply-preview');
const replyPreviewText = document.getElementById('reply-preview-text');

// Function to handle closing the modal with unsaved changes check
function closeModal() {
    const currentNoteText = noteInput.value.trim();
    let hasUnsavedChanges = false;

    if (state.modalMode === 'create') {
        hasUnsavedChanges = currentNoteText !== '';
    } else if (state.modalMode === 'edit') {
        hasUnsavedChanges = currentNoteText !== state.originalNoteText;
    } else if (state.modalMode === 'reply') {
        hasUnsavedChanges = currentNoteText !== '';
    }

    if (hasUnsavedChanges) {
        showConfirmationModal();
    } else {
        noteInput.value = '';
        modal.classList.add('hidden');
        state.modalMode = 'create';
        state.editingNote = null;
        state.replyingToNote = null;
        state.replyingToNoteId = null;
        state.originalNoteText = '';
        removeReply();
    }
}

// Show the confirmation modal
function showConfirmationModal() {
    confirmationModal.classList.remove('hidden');
}

// Function to remove the reply
function removeReply() {
    replyPreview.classList.add('hidden');
    replyPreviewText.textContent = '';
    state.replyingToNote = null;
    state.replyingToNoteId = null;
    state.replyPreviewTextContent = '';
}

// Function to show the reply preview in the modal
function showReplyPreview(text) {
    const shortenedText = text.length > 100 ? text.substring(0, 100) + '...' : text;
    replyPreviewText.textContent = shortenedText;
    replyPreview.classList.remove('hidden');
}

// Event listeners related to modal
function setupModalEventListeners() {
    cancelBtn.addEventListener('click', () => {
        closeModal();
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    modalContent.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    confirmCancelBtn.addEventListener('click', () => {
        confirmationModal.classList.add('hidden');
    });

    confirmDiscardBtn.addEventListener('click', () => {
        confirmationModal.classList.add('hidden');
        noteInput.value = '';
        modal.classList.add('hidden');
        state.modalMode = 'create';
        state.editingNote = null;
        state.replyingToNote = null;
        state.replyingToNoteId = null;
        state.originalNoteText = '';
        removeReply();
    });

    removeReplyCancelBtn.addEventListener('click', () => {
        removeReplyModal.classList.add('hidden');
    });

    removeReplyConfirmBtn.addEventListener('click', () => {
        removeReply();
        removeReplyModal.classList.add('hidden');
    });
}

export { setupModalEventListeners, removeReply, showReplyPreview };
