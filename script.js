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
const themeToggle = document.getElementById('theme-toggle');
const replyNoteOption = document.getElementById('reply-note');
const removeReplyIcon = document.getElementById('remove-reply-icon');
const removeReplyModal = document.getElementById('remove-reply-modal');
const removeReplyCancelBtn = document.getElementById('remove-reply-cancel-btn');
const removeReplyConfirmBtn = document.getElementById('remove-reply-confirm-btn');
const replyPreview = document.getElementById('reply-preview');
const replyPreviewText = document.getElementById('reply-preview-text');

let selectedNote = null; // To keep track of the note that was right-clicked
let modalMode = 'create'; // 'create', 'edit', or 'reply'
let editingNote = null; // The note being edited
let originalNoteText = ''; // To store the original text during editing
let replyingToNote = null; // The note being replied to
let replyingToNoteId = null; // The id of the note being replied to
let replyPreviewTextContent = ''; // To store the reply preview text during editing

// Function to create a note
function createNote(text, replyToNote = null, replyToNoteId = null) {
    // Create new note block
    const newNote = document.createElement('div');
    newNote.classList.add('note', 'bg-noteBackground', 'text-textColor');
    newNote.id = 'note-' + Date.now(); // Assign an id

    // If this note is a reply, add the reply preview above the note text
    if (replyToNoteId) {
        // Create a link that wraps the reply preview
        const replyPreviewLink = document.createElement('a');
        replyPreviewLink.href = 'note?id=' + replyToNoteId; // Use the id of the note being replied to
        replyPreviewLink.classList.add('reply-preview-in-note', 'bg-background', 'text-textColor', 'rounded-md', 'p-2', 'mb-2', 'block'); // Add 'block' to make it a block-level element

        // Get the text of the note we're replying to
        let replyToText = '';

        if (replyToNote) {
            replyToText = replyToNote.querySelector('.note-text').textContent;
        } else {
            // Since we might not have the actual note element, use stored text content
            replyToText = replyPreviewTextContent;
        }

        const shortenedText = replyToText.length > 100 ? replyToText.substring(0, 100) + '...' : replyToText;

        // Create a span to hold the text
        const replyTextSpan = document.createElement('span');
        replyTextSpan.textContent = shortenedText;

        // Append the text to the link
        replyPreviewLink.appendChild(replyTextSpan);

        // Append the link to the new note
        newNote.appendChild(replyPreviewLink);
    }

    // Add note text with word break and multiline support
    const noteDiv = document.createElement('div');
    noteDiv.classList.add('note-text');
    noteDiv.textContent = text;

    // Append noteText to newNote
    newNote.appendChild(noteDiv);

    // Create note-bottom div
    const noteBottomDiv = document.createElement('div');
    noteBottomDiv.classList.add('note-bottom');

    // Create note-buttons div
    const noteButtonsDiv = document.createElement('div');
    noteButtonsDiv.classList.add('note-buttons');

    // Create reply icon
    const replyIcon = document.createElement('img');
    replyIcon.src = 'https://www.svgrepo.com/download/514218/reply.svg';
    replyIcon.alt = 'Reply Icon';
    replyIcon.classList.add('reply-icon', 'w-5', 'h-5', 'cursor-pointer', 'icon-filter');

    // Create reply count (placeholder number)
    const replyCount = document.createElement('span');
    replyCount.textContent = '3'; // Placeholder number
    replyCount.classList.add('reply-count');

    // Append reply icon and reply count to note-buttons
    noteButtonsDiv.appendChild(replyIcon);
    noteButtonsDiv.appendChild(replyCount);

    // Create time div
    const timeDiv = document.createElement('div');
    timeDiv.classList.add('note-time');
    const currentTime = new Date().toUTCString();
    timeDiv.textContent = currentTime;

    // Append note-buttons and note-time to note-bottom
    noteBottomDiv.appendChild(noteButtonsDiv);
    noteBottomDiv.appendChild(timeDiv);

    // Append note-bottom to newNote
    newNote.appendChild(noteBottomDiv);

    // Append new note to notes container
    notesContainer.appendChild(newNote);

    // Add context menu functionality to the new note
    newNote.addEventListener('contextmenu', noteContextMenuHandler);

    // Add event listener to reply icon
    replyIcon.addEventListener('click', () => {
        handleReplyClick(newNote);
    });

    return newNote;
}

// Function to handle reply icon click
function handleReplyClick(note) {
    if (note) {
        modalMode = 'reply';
        replyingToNote = note;
        replyingToNoteId = note.id; // Store the id
        originalNoteText = '';
        noteInput.value = '';
        // Get the text of the note we're replying to
        const replyToText = note.querySelector('.note-text').textContent;
        // Store the reply text content
        replyPreviewTextContent = replyToText;
        // Show the reply preview in the modal
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

    // Handle reply preservation or removal
    if (!replyingToNoteId) {
        // Remove the reply block from the note if it exists
        const replyPreviewInNote = noteElement.querySelector('.reply-preview-in-note');
        if (replyPreviewInNote) {
            replyPreviewInNote.remove();
        }
    } else {
        // Ensure the reply block is present
        let replyPreviewInNote = noteElement.querySelector('.reply-preview-in-note');

        if (!replyPreviewInNote) {
            // Create a new reply preview block
            replyPreviewInNote = document.createElement('a');
            replyPreviewInNote.href = 'note?id=' + replyingToNoteId;
            replyPreviewInNote.classList.add('reply-preview-in-note', 'bg-background', 'text-textColor', 'rounded-md', 'p-2', 'mb-2', 'block');

            // Create a span to hold the text
            const replyTextSpan = document.createElement('span');
            replyTextSpan.textContent = replyPreviewTextContent; // Use stored text

            // Append the text to the link
            replyPreviewInNote.appendChild(replyTextSpan);

            // Insert the reply preview before the note text
            noteElement.insertBefore(replyPreviewInNote, noteDiv);
        }
    }
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
    replyingToNote = null;
    replyingToNoteId = null;
    originalNoteText = '';
    noteInput.value = '';
    modalTitle.textContent = 'Create Note';
    postBtn.textContent = 'Post';
    // Hide reply preview if visible
    removeReply();
    modal.classList.remove('hidden');
});

// Handle 'Post' or 'Save' button click
postBtn.addEventListener('click', () => {
    const noteText = noteInput.value.trim();

    if (noteText) {
        if (modalMode === 'create') {
            createNote(noteText);
            // Placeholder for API call to create a new note
            // TODO: Replace this with actual API call to backend
        } else if (modalMode === 'edit' && editingNote) {
            editNote(editingNote, noteText);

            // Placeholder for API call to update the note
            // TODO: Replace this with actual API call to backend

            editingNote = null;
        } else if (modalMode === 'reply') {
            createNote(noteText, replyingToNote, replyingToNoteId);
            // Placeholder for API call to create a reply
            // TODO: Replace this with actual API call to backend

            replyingToNote = null;
            replyingToNoteId = null;
        }

        // Clear input and hide modal
        noteInput.value = '';
        modal.classList.add('hidden');
        modalMode = 'create';
        originalNoteText = '';
        // Hide reply preview
        removeReply();
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
    } else if (modalMode === 'reply') {
        hasUnsavedChanges = currentNoteText !== '';
    }

    if (hasUnsavedChanges) {
        showConfirmationModal();
    } else {
        noteInput.value = '';
        modal.classList.add('hidden');
        modalMode = 'create';
        editingNote = null;
        replyingToNote = null;
        replyingToNoteId = null;
        originalNoteText = '';
        // Hide reply preview
        removeReply();
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
    replyingToNote = null;
    replyingToNoteId = null;
    originalNoteText = '';
    // Hide reply preview
    removeReply();
});

// Event listener for remove reply icon
removeReplyIcon.addEventListener('click', () => {
    // Show the confirmation modal for removing the reply
    removeReplyModal.classList.remove('hidden');
});

// Handle 'Cancel' button in remove reply confirmation modal
removeReplyCancelBtn.addEventListener('click', () => {
    removeReplyModal.classList.add('hidden');
});

// Handle 'Remove' button in remove reply confirmation modal
removeReplyConfirmBtn.addEventListener('click', () => {
    removeReply();
    removeReplyModal.classList.add('hidden');
});

// Function to remove the reply
function removeReply() {
    replyPreview.classList.add('hidden');
    replyPreviewText.textContent = '';
    replyingToNote = null;
    replyingToNoteId = null;
    replyPreviewTextContent = '';
}

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
        // Placeholder for API call to delete the note
        // TODO: Replace this with actual API call to backend

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

        // Check if the note has a reply preview
        const replyPreviewInNote = selectedNote.querySelector('.reply-preview-in-note');
        if (replyPreviewInNote) {
            // Set up the reply preview in the modal
            const replyToText = replyPreviewInNote.textContent;
            showReplyPreview(replyToText);

            // Retrieve the id from the href attribute
            const href = replyPreviewInNote.getAttribute('href');
            const urlParams = new URLSearchParams(href.split('?')[1]);
            replyingToNoteId = urlParams.get('id');

            // Store the reply text content
            replyPreviewTextContent = replyToText;
        } else {
            removeReply();
        }

        modalTitle.textContent = 'Edit Note';
        postBtn.textContent = 'Save';
        modal.classList.remove('hidden');
        contextMenu.style.display = 'none'; // Hide the context menu
    }
});

// Reply to the selected note when clicking the "Reply" option in the context menu
replyNoteOption.addEventListener('click', () => {
    if (selectedNote) {
        handleReplyClick(selectedNote);
        contextMenu.style.display = 'none'; // Hide the context menu
    }
});

// Function to show the reply preview in the modal
function showReplyPreview(text) {
    const shortenedText = text.length > 100 ? text.substring(0, 100) + '...' : text;
    replyPreviewText.textContent = shortenedText;
    replyPreview.classList.remove('hidden');
}

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
    // Toggle the 'dark' class on the HTML element
    document.documentElement.classList.toggle('dark');
    // Update the icon
    updateThemeIcon();
    // Save the user's preference in localStorage
    if (document.documentElement.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

// Function to update the theme icon based on the current theme
function updateThemeIcon() {
    if (document.documentElement.classList.contains('dark')) {
        themeToggle.src = 'https://www.svgrepo.com/download/45607/day-of-sun.svg';
        themeToggle.alt = 'Switch to Light Mode';
    } else {
        themeToggle.src = 'https://www.svgrepo.com/download/487620/night.svg';
        themeToggle.alt = 'Switch to Dark Mode';
    }
}

// On page load, set the theme based on user preference or system setting
(function initializeTheme() {
    const userTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (userTheme === 'dark' || (!userTheme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    updateThemeIcon();
})();
