// ./js/theme.js

// Get DOM elements
const themeToggle = document.getElementById('theme-toggle');

// Update the theme icon based on the current theme
function updateThemeIcon() {
    if (document.documentElement.classList.contains('dark')) {
        themeToggle.src = 'https://www.svgrepo.com/download/45607/day-of-sun.svg';
        themeToggle.alt = 'Switch to Light Mode';
    } else {
        themeToggle.src = 'https://www.svgrepo.com/download/487620/night.svg';
        themeToggle.alt = 'Switch to Dark Mode';
    }
}

// Initialize theme based on user preference or system setting
function initializeTheme() {
    const userTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (userTheme === 'dark' || (!userTheme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    updateThemeIcon();
}

// Event listener for theme toggle
themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    updateThemeIcon();
    if (document.documentElement.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

export { initializeTheme };
