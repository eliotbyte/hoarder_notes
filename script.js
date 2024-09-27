const plusIcon = document.getElementById('plus-icon');
const modal = document.getElementById('modal');
const postBtn = document.getElementById('post-btn');
const noteInput = document.getElementById('note-input');
const notesContainer = document.getElementById('notes');
const modalContent = document.getElementById('modal-content');
const contextMenu = document.getElementById('context-menu');
const modalTitle = document.getElementById('modal-title');
const cancelBtn = document.getElementById('cancel-btn');
const confirmationModal = document.getElementById('confirmation-modal');
const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
const confirmDiscardBtn = document.getElementById('confirm-discard-btn');

let selectedNote = null; // To keep track of the note that was right-clicked
let modalMode = 'create'; // 'create' or 'edit'
let editingNote = null; // The note being edited
let originalNoteText = ''; // To store the original text during editing

// Function to create a note
function createNote(text) {
    // Create new note block
    const newNote = document.createElement('div');
    newNote.classList.add('note');
    newNote.id = 'note-' + Date.now(); // Assign an id

    // Add note text with word break and multiline support
    const noteDiv = document.createElement('div');
    noteDiv.classList.add('note-text');
    noteDiv.textContent = text;

    // Create time div
    const timeDiv = document.createElement('div');
    timeDiv.classList.add('note-time');
    const currentTime = new Date().toUTCString();
    timeDiv.textContent = currentTime;

    // Append noteText and timeDiv to newNote
    newNote.appendChild(noteDiv);
    newNote.appendChild(timeDiv);

    // Append new note to notes container
    notesContainer.appendChild(newNote);

    // Add context menu functionality to the new note
    newNote.addEventListener('contextmenu', noteContextMenuHandler);

    return newNote;
}

// Function to edit a note
function editNote(noteElement, newText) {
    const noteDiv = noteElement.querySelector('.note-text');
    noteDiv.textContent = newText;

    const timeDiv = noteElement.querySelector('.note-time');
    const currentTime = new Date().toUTCString();
    timeDiv.textContent = currentTime;
}

// Function to handle note context menu
function noteContextMenuHandler(event) {
    event.preventDefault(); // Prevent the default context menu from showing
    selectedNote = this; // Store the clicked note
    contextMenu.style.top = `${event.pageY}px`;
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.style.display = 'block'; // Show the custom context menu
}

// Show modal when plus icon is clicked
plusIcon.addEventListener('click', () => {
    modalMode = 'create';
    editingNote = null;
    originalNoteText = '';
    noteInput.value = '';
    modalTitle.textContent = 'Create Note';
    postBtn.textContent = 'Post';
    modal.classList.remove('hidden');
});

// Handle 'Post' or 'Save' button click
postBtn.addEventListener('click', () => {
    const noteText = noteInput.value.trim();

    if (noteText) {
        if (modalMode === 'create') {
            createNote(noteText);
        } else if (modalMode === 'edit' && editingNote) {
            editNote(editingNote, noteText);
            editingNote = null;
        }

        // Clear input and hide modal
        noteInput.value = '';
        modal.classList.add('hidden');
        modalMode = 'create';
        originalNoteText = '';
    }
});

// Handle 'Cancel' button click
cancelBtn.addEventListener('click', () => {
    closeModal();
});

// Close modal when clicking outside of the modal content
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

// Prevent clicks inside modal-content from closing the modal
modalContent.addEventListener('click', (event) => {
    event.stopPropagation();
});

// Function to handle closing the modal with unsaved changes check
function closeModal() {
    const currentNoteText = noteInput.value.trim();
    let hasUnsavedChanges = false;

    if (modalMode === 'create') {
        hasUnsavedChanges = currentNoteText !== '';
    } else if (modalMode === 'edit') {
        hasUnsavedChanges = currentNoteText !== originalNoteText;
    }

    if (hasUnsavedChanges) {
        showConfirmationModal();
    } else {
        noteInput.value = '';
        modal.classList.add('hidden');
        modalMode = 'create';
        editingNote = null;
        originalNoteText = '';
    }
}

// Show the confirmation modal
function showConfirmationModal() {
    confirmationModal.classList.remove('hidden');
}

// Handle 'Cancel' button in confirmation modal
confirmCancelBtn.addEventListener('click', () => {
    confirmationModal.classList.add('hidden');
});

// Handle 'Discard' button in confirmation modal
confirmDiscardBtn.addEventListener('click', () => {
    confirmationModal.classList.add('hidden');
    noteInput.value = '';
    modal.classList.add('hidden');
    modalMode = 'create';
    editingNote = null;
    originalNoteText = '';
});

// Prevent context menu from closing when clicking on it
contextMenu.addEventListener('contextmenu', (event) => {
    event.preventDefault(); // Prevent context menu behavior on itself
});

// Hide the context menu when clicking anywhere else
document.addEventListener('click', (event) => {
    if (!contextMenu.contains(event.target)) {
        contextMenu.style.display = 'none'; // Hide the custom context menu
    }
});

// Delete the selected note when clicking the "Delete" option in the context menu
document.getElementById('delete-note').addEventListener('click', () => {
    if (selectedNote) {
        selectedNote.remove(); // Remove the selected note from the DOM
        selectedNote = null; // Clear the reference
        contextMenu.style.display = 'none'; // Hide the context menu
    }
});

// Edit the selected note when clicking the "Edit" option in the context menu
document.getElementById('edit-note').addEventListener('click', () => {
    if (selectedNote) {
        modalMode = 'edit';
        editingNote = selectedNote;
        originalNoteText = selectedNote.querySelector('.note-text').textContent;
        noteInput.value = originalNoteText;
        modalTitle.textContent = 'Edit Note';
        postBtn.textContent = 'Save';
        modal.classList.remove('hidden');
        contextMenu.style.display = 'none'; // Hide the context menu
    }
});
