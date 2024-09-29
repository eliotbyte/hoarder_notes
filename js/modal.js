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
const noteTagsInputContainer = document.getElementById('note-tags-input-container');
const noteTagsInput = document.getElementById('note-tags-input');

// Function to handle closing the modal with unsaved changes check
function closeModal() {
    const currentNoteText = noteInput.value.trim();
    const currentTags = state.tags;
    let hasUnsavedChanges = false;

    if (state.modalMode === 'create') {
        hasUnsavedChanges = currentNoteText !== '' || currentTags.length > 0;
    } else if (state.modalMode === 'edit') {
        hasUnsavedChanges = currentNoteText !== state.originalNoteText || !arraysEqual(currentTags, state.originalNoteTags);
    } else if (state.modalMode === 'reply') {
        hasUnsavedChanges = currentNoteText !== '' || currentTags.length > 0;
    }

    if (hasUnsavedChanges) {
        showConfirmationModal();
    } else {
        resetModal();
    }
}

// Utility function to compare two arrays
function arraysEqual(a1, a2) {
    return JSON.stringify(a1) === JSON.stringify(a2);
}

// Show the confirmation modal
function showConfirmationModal() {
    confirmationModal.classList.remove('hidden');
}

// Function to reset the modal state
function resetModal() {
    noteInput.value = '';
    modal.classList.add('hidden');
    state.modalMode = 'create';
    state.editingNote = null;
    state.replyingToNote = null;
    state.replyingToNoteId = null;
    state.originalNoteText = '';
    state.originalNoteTags = [];
    state.tags = [];
    removeReply();
    clearTags();
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

// Function to clear tags in the modal
function clearTags() {
    const tags = noteTagsInputContainer.querySelectorAll('.tag');
    tags.forEach(tag => tag.remove());
    noteTagsInput.value = '';
}

// Function to create a tag element
function createTagElement(text) {
    const tag = document.createElement('div');
    tag.classList.add('tag');

    const tagText = document.createElement('span');
    tagText.classList.add('tag-text');
    tagText.textContent = text;

    const removeIcon = document.createElement('img');
    removeIcon.src = 'https://www.svgrepo.com/download/509072/cross.svg';
    removeIcon.alt = 'Remove Tag';
    removeIcon.classList.add('tag-remove');

    removeIcon.addEventListener('click', () => {
        const index = state.tags.indexOf(text);
        if (index > -1) {
            state.tags.splice(index, 1);
        }
        tag.remove();
    });

    tag.addEventListener('click', () => {
        noteTagsInput.value = text;
        const index = state.tags.indexOf(text);
        if (index > -1) {
            state.tags.splice(index, 1);
        }
        tag.remove();
        noteTagsInput.focus();
    });

    tag.appendChild(tagText);
    tag.appendChild(removeIcon);

    return tag;
}

// Event listener for tags input field
function handleTagsInput(event) {
    const inputValue = noteTagsInput.value.trim();

    if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        if (inputValue !== '') {
            if (/^[a-zA-Z0-9]+$/.test(inputValue)) {
                if (!state.tags.includes(inputValue)) {
                    const tagElement = createTagElement(inputValue);
                    noteTagsInputContainer.insertBefore(tagElement, noteTagsInput);
                    state.tags.push(inputValue);
                    noteTagsInput.value = '';
                }
            } else {
                alert('Tags can only contain letters and numbers.');
            }
        }
    }
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
        resetModal();
    });

    removeReplyCancelBtn.addEventListener('click', () => {
        removeReplyModal.classList.add('hidden');
    });

    removeReplyConfirmBtn.addEventListener('click', () => {
        removeReply();
        removeReplyModal.classList.add('hidden');
    });

    noteTagsInput.addEventListener('keydown', handleTagsInput);
}

export { setupModalEventListeners, removeReply, showReplyPreview };
