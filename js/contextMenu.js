// ./js/contextMenu.js

const contextMenu = document.getElementById('context-menu');

// Event listeners related to context menu
function setupContextMenuEventListeners() {
    contextMenu.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    document.addEventListener('click', (event) => {
        if (!contextMenu.contains(event.target)) {
            contextMenu.style.display = 'none';
        }
    });
}

export { setupContextMenuEventListeners };
