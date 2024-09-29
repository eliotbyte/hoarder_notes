// ./js/notes.js

import { state } from './state.js';
import { removeReply, showReplyPreview } from './modal.js';

// Get DOM elements
const plusIcon = document.getElementById('plus-icon');
const postBtn = document.getElementById('post-btn');
const noteInput = document.getElementById('note-input');
const notesContainer = document.getElementById('notes');
const modalTitle = document.getElementById('modal-title');
const modal = document.getElementById('modal');
const replyNoteOption = document.getElementById('reply-note');
const removeReplyIcon = document.getElementById('remove-reply-icon');
const replyPreview = document.getElementById('reply-preview');
const replyPreviewText = document.getElementById('reply-preview-text');
const contextMenu = document.getElementById('context-menu');

// Function to create a note
function createNote(text, replyToNote = null, replyToNoteId = null) {
    const newNote = document.createElement('div');
    newNote.classList.add('note', 'bg-noteBackground', 'text-textColor');
    newNote.id = 'note-' + Date.now(); // Assign a unique ID

    // If this note is a reply, add the reply preview above the note text
    if (replyToNoteId) {
        const replyPreviewLink = document.createElement('a');
        replyPreviewLink.href = 'note?id=' + replyToNoteId;
        replyPreviewLink.classList.add('reply-preview-in-note', 'bg-background', 'text-textColor', 'rounded-md', 'p-2', 'mb-2', 'block');

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

    const noteBottomDiv = document.createElement('div');
    noteBottomDiv.classList.add('note-bottom');

    const noteButtonsDiv = document.createElement('div');
    noteButtonsDiv.classList.add('note-buttons');

    const replyIcon = document.createElement('img');
    replyIcon.src = 'https://www.svgrepo.com/download/514218/reply.svg';
    replyIcon.alt = 'Reply Icon';
    replyIcon.classList.add('reply-icon', 'w-5', 'h-5', 'cursor-pointer', 'icon-filter');

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

        const replyToText = note.querySelector('.note-text').textContent;
        state.replyPreviewTextContent = replyToText;

        showReplyPreview(replyToText);
        modalTitle.textContent = 'Reply to Note';
        postBtn.textContent = 'Post';
        modal.classList.remove('hidden');
    }
}

// Function to edit a note
function editNote(noteElement, newText) {
    const noteDiv = noteElement.querySelector('.note-text');
    noteDiv.textContent = newText;

    const timeDiv = noteElement.querySelector('.note-time');
    const currentTime = new Date().toUTCString();
    timeDiv.textContent = currentTime;

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
        noteInput.value = '';
        modalTitle.textContent = 'Create Note';
        postBtn.textContent = 'Post';
        removeReply();
        modal.classList.remove('hidden');
    });

    postBtn.addEventListener('click', () => {
        const noteText = noteInput.value.trim();

        if (noteText) {
            if (state.modalMode === 'create') {
                createNote(noteText);
            } else if (state.modalMode === 'edit' && state.editingNote) {
                editNote(state.editingNote, noteText);
                state.editingNote = null;
            } else if (state.modalMode === 'reply') {
                createNote(noteText, state.replyingToNote, state.replyingToNoteId);
                state.replyingToNote = null;
                state.replyingToNoteId = null;
            }

            noteInput.value = '';
            modal.classList.add('hidden');
            state.modalMode = 'create';
            state.originalNoteText = '';
            removeReply();
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

export { setupNoteEventListeners };
