// ./js/main.js

import { initializeTheme } from './theme.js';
import { setupNoteEventListeners } from './notes.js';
import { setupModalEventListeners } from './modal.js';
import { setupContextMenuEventListeners } from './contextMenu.js';

// Initialize modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    setupNoteEventListeners();
    setupModalEventListeners();
    setupContextMenuEventListeners();
});
