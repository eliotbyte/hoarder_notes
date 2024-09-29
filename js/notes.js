// ./js/notes.js

import { state } from './state.js';
import { removeReply, showReplyPreview } from './modal.js';

// Get DOM elements
const plusIcon = document.getElementById('plus-icon');
const postBtn = document.getElementById('post-btn');
const noteInput = document.getElementById('note-input');
const noteTagsInputContainer = document.getElementById('note-tags-input-container');
const noteTagsInput = document.getElementById('note-tags-input');
const notesContainer = document.getElementById('notes');
const modalTitle = document.getElementById('modal-title');
const modal = document.getElementById('modal');
const replyNoteOption = document.getElementById('reply-note');
const removeReplyIcon = document.getElementById('remove-reply-icon');
const replyPreview = document.getElementById('reply-preview');
const replyPreviewText = document.getElementById('reply-preview-text');
const contextMenu = document.getElementById('context-menu');

// Function to create a note
function createNote(text, tags = [], replyToNote = null, replyToNoteId = null) {
    const newNote = document.createElement('div');
    newNote.classList.add('note', 'bg-noteBackground', 'text-textColor');
    newNote.id = 'note-' + Date.now(); // Assign a unique ID

    // If this note is a reply, add the reply preview above the note text
    if (replyToNoteId) {
        const replyPreviewLink = document.createElement('a');
        replyPreviewLink.href = 'note?id=' + replyToNoteId;
        replyPreviewLink.classList.add('reply-preview-in-note', 'bg-background', 'text-textColor', 'rounded-md', 'p-2', 'mb-2', 'block');
        replyPreviewLink.style.userSelect = 'none';

        let replyToText = '';

        if (replyToNote) {
            replyToText = replyToNote.querySelector('.note-text').textContent;
        } else {
            replyToText = state.replyPreviewTextContent;
        }

        const shortenedText = replyToText.length > 100 ? replyToText.substring(0, 100) + '...' : replyToText;

        const replyTextSpan = document.createElement('span');
        replyTextSpan.textContent = shortenedText;

        replyPreviewLink.appendChild(replyTextSpan);
        newNote.appendChild(replyPreviewLink);
    }

    const noteDiv = document.createElement('div');
    noteDiv.classList.add('note-text');
    noteDiv.textContent = text;

    newNote.appendChild(noteDiv);

    // Add tags to the note
    if (tags.length > 0) {
        const tagsDiv = document.createElement('div');
        tagsDiv.classList.add('note-tags');

        tags.forEach(tagText => {
            const tagLink = document.createElement('a');
            tagLink.href = '#';
            tagLink.classList.add('note-tag');
            tagLink.textContent = tagText;
            tagLink.style.userSelect = 'none';
            tagsDiv.appendChild(tagLink);
        });

        newNote.appendChild(tagsDiv);
    }

    const noteBottomDiv = document.createElement('div');
    noteBottomDiv.classList.add('note-bottom');

    const noteButtonsDiv = document.createElement('div');
    noteButtonsDiv.classList.add('note-buttons');

    const replyIcon = document.createElement('img');
    replyIcon.src = 'https://www.svgrepo.com/download/514218/reply.svg';
    replyIcon.alt = 'Reply Icon';
    replyIcon.classList.add('reply-icon', 'w-5', 'h-5', 'cursor-pointer', 'icon-filter');
    replyIcon.style.userSelect = 'none';

    const replyCount = document.createElement('span');
    replyCount.textContent = '3'; // Placeholder number
    replyCount.classList.add('reply-count');

    noteButtonsDiv.appendChild(replyIcon);
    noteButtonsDiv.appendChild(replyCount);

    const timeDiv = document.createElement('div');
    timeDiv.classList.add('note-time');
    const currentTime = new Date().toUTCString();
    timeDiv.textContent = currentTime;

    noteBottomDiv.appendChild(noteButtonsDiv);
    noteBottomDiv.appendChild(timeDiv);

    newNote.appendChild(noteBottomDiv);

    notesContainer.appendChild(newNote);

    newNote.addEventListener('contextmenu', noteContextMenuHandler);

    replyIcon.addEventListener('click', () => {
        handleReplyClick(newNote);
    });

    return newNote;
}

// Function to handle reply icon click
function handleReplyClick(note) {
    if (note) {
        state.modalMode = 'reply';
        state.replyingToNote = note;
        state.replyingToNoteId = note.id;
        state.originalNoteText = '';
        noteInput.value = '';
        state.tags = [];
        clearTags();

        const replyToText = note.querySelector('.note-text').textContent;
        state.replyPreviewTextContent = replyToText;

        showReplyPreview(replyToText);
        modalTitle.textContent = 'Reply to Note';
        postBtn.textContent = 'Post';
        modal.classList.remove('hidden');
    }
}

// Function to clear tags in the modal
function clearTags() {
    const tags = noteTagsInputContainer.querySelectorAll('.tag');
    tags.forEach(tag => tag.remove());
    noteTagsInput.value = '';
}

// Function to populate tags in the modal when editing
function populateTags(tags) {
    clearTags();
    tags.forEach(tagText => {
        const tagElement = createTagElement(tagText);
        noteTagsInputContainer.insertBefore(tagElement, noteTagsInput);
    });
}

// Function to create a tag element (same as in modal.js)
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

    // Prevent event bubbling to the tag click event
    removeIcon.addEventListener('click', (event) => {
        event.stopPropagation();
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

// Function to edit a note
function editNote(noteElement, newText, newTags = []) {
    const noteDiv = noteElement.querySelector('.note-text');
    noteDiv.textContent = newText;

    const timeDiv = noteElement.querySelector('.note-time');
    const currentTime = new Date().toUTCString();
    timeDiv.textContent = currentTime;

    // Update tags
    let tagsDiv = noteElement.querySelector('.note-tags');
    if (tagsDiv) {
        tagsDiv.innerHTML = '';
    } else if (newTags.length > 0) {
        tagsDiv = document.createElement('div');
        tagsDiv.classList.add('note-tags');
        noteElement.insertBefore(tagsDiv, noteElement.querySelector('.note-bottom'));
    }

    if (newTags.length > 0) {
        newTags.forEach(tagText => {
            const tagLink = document.createElement('a');
            tagLink.href = '#';
            tagLink.classList.add('note-tag');
            tagLink.textContent = tagText;
            tagLink.style.userSelect = 'none';
            tagsDiv.appendChild(tagLink);
        });
    } else if (tagsDiv) {
        tagsDiv.remove();
    }

    if (!state.replyingToNoteId) {
        const replyPreviewInNote = noteElement.querySelector('.reply-preview-in-note');
        if (replyPreviewInNote) {
            replyPreviewInNote.remove();
        }
    } else {
        let replyPreviewInNote = noteElement.querySelector('.reply-preview-in-note');

        if (!replyPreviewInNote) {
            replyPreviewInNote = document.createElement('a');
            replyPreviewInNote.href = 'note?id=' + state.replyingToNoteId;
            replyPreviewInNote.classList.add('reply-preview-in-note', 'bg-background', 'text-textColor', 'rounded-md', 'p-2', 'mb-2', 'block');
            replyPreviewInNote.style.userSelect = 'none';

            const replyTextSpan = document.createElement('span');
            replyTextSpan.textContent = state.replyPreviewTextContent;

            replyPreviewInNote.appendChild(replyTextSpan);
            noteElement.insertBefore(replyPreviewInNote, noteDiv);
        }
    }
}

// Function to handle note context menu
function noteContextMenuHandler(event) {
    event.preventDefault();
    state.selectedNote = this;
    contextMenu.style.top = `${event.pageY}px`;
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.style.display = 'block';
}

// Event listeners
function setupNoteEventListeners() {
    plusIcon.addEventListener('click', () => {
        state.modalMode = 'create';
        state.editingNote = null;
        state.replyingToNote = null;
        state.replyingToNoteId = null;
        state.originalNoteText = '';
        state.originalNoteTags = [];
        state.tags = [];
        noteInput.value = '';
        clearTags();
        modalTitle.textContent = 'Create Note';
        postBtn.textContent = 'Post';
        removeReply();
        modal.classList.remove('hidden');
    });

    postBtn.addEventListener('click', () => {
        const noteText = noteInput.value.trim();
        const tags = state.tags;

        if (noteText) {
            if (state.modalMode === 'create') {
                createNote(noteText, tags);
            } else if (state.modalMode === 'edit' && state.editingNote) {
                editNote(state.editingNote, noteText, tags);
                state.editingNote = null;
            } else if (state.modalMode === 'reply') {
                createNote(noteText, tags, state.replyingToNote, state.replyingToNoteId);
                state.replyingToNote = null;
                state.replyingToNoteId = null;
            }

            resetModal();
        }
    });

    removeReplyIcon.addEventListener('click', () => {
        // Show the confirmation modal for removing the reply
        const removeReplyModal = document.getElementById('remove-reply-modal');
        removeReplyModal.classList.remove('hidden');
    });

    replyNoteOption.addEventListener('click', () => {
        if (state.selectedNote) {
            handleReplyClick(state.selectedNote);
            contextMenu.style.display = 'none';
        }
    });

    document.getElementById('delete-note').addEventListener('click', () => {
        if (state.selectedNote) {
            state.selectedNote.remove();
            state.selectedNote = null;
            contextMenu.style.display = 'none';
        }
    });

    document.getElementById('edit-note').addEventListener('click', () => {
        if (state.selectedNote) {
            state.modalMode = 'edit';
            state.editingNote = state.selectedNote;
            state.originalNoteText = state.selectedNote.querySelector('.note-text').textContent;
            noteInput.value = state.originalNoteText;

            // Get tags from the note
            const tagsDiv = state.selectedNote.querySelector('.note-tags');
            if (tagsDiv) {
                state.originalNoteTags = Array.from(tagsDiv.querySelectorAll('.note-tag')).map(tag => tag.textContent);
            } else {
                state.originalNoteTags = [];
            }
            state.tags = [...state.originalNoteTags];
            populateTags(state.tags);

            const replyPreviewInNote = state.selectedNote.querySelector('.reply-preview-in-note');
            if (replyPreviewInNote) {
                const replyToText = replyPreviewInNote.textContent;
                showReplyPreview(replyToText);

                const href = replyPreviewInNote.getAttribute('href');
                const urlParams = new URLSearchParams(href.split('?')[1]);
                state.replyingToNoteId = urlParams.get('id');

                state.replyPreviewTextContent = replyToText;
            } else {
                removeReply();
            }

            modalTitle.textContent = 'Edit Note';
            postBtn.textContent = 'Save';
            modal.classList.remove('hidden');
            contextMenu.style.display = 'none';
        }
    });

    // Add context menu functionality to existing notes if any
    const existingNotes = document.querySelectorAll('.note');
    existingNotes.forEach(note => {
        note.addEventListener('contextmenu', noteContextMenuHandler);
    });
}

// Function to reset the modal
function resetModal() {
    noteInput.value = '';
    modal.classList.add('hidden');
    state.modalMode = 'create';
    state.originalNoteText = '';
    state.originalNoteTags = [];
    state.tags = [];
    clearTags();
    removeReply();
}

export { setupNoteEventListeners };
