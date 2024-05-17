// Import necessary data and constants
import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

// Initialize page and matches
let page = 1;
let matches = books;

// Function to create a preview element for a book
const createPreviewElement = ({ author, id, image, title }) => {
    const element = document.createElement('button');
    element.classList = 'preview';
    element.setAttribute('data-preview', id);

    element.innerHTML = `
        <img
            class="preview__image"
            src="${image}"
        />
        
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;

    return element;
};

// Function to render books
const renderBooks = (result) => {
    // Select the list items container
    const listItems = document.querySelector('[data-list-items]');
    // Clear existing items
    listItems.innerHTML = '';

    // Create a fragment to append new items
    const fragment = document.createDocumentFragment();
    // Iterate over the result and create preview elements for each book
    for (const book of result.slice(0, BOOKS_PER_PAGE)) {
        const element = createPreviewElement(book);
        fragment.appendChild(element);
    }
    // Append the fragment to the list items container
    listItems.appendChild(fragment);

    // Calculate the remaining books
    const remaining = Math.max(matches.length - page * BOOKS_PER_PAGE, 0);
    // Enable/disable the "Show more" button based on the remaining books
    const listButton = document.querySelector('[data-list-button]');
    listButton.disabled = remaining <= 0;
    // Update the button text with the remaining count
    listButton.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${remaining})</span>
    `;
};

// Function to render options for select elements
const renderOptions = (data, selector, defaultValue, defaultText) => {
    // Create a document fragment to hold the options
    const html = document.createDocumentFragment();
    // Create the default option
    const defaultElement = document.createElement('option');
    defaultElement.value = defaultValue;
    defaultElement.innerText = defaultText;
    html.appendChild(defaultElement);

    // Iterate over the data and create option elements
    for (const [id, name] of Object.entries(data)) {
        const element = document.createElement('option');
        element.value = id;
        element.innerText = name;
        html.appendChild(element);
    }

    // Append the options to the select element
    document.querySelector(selector).appendChild(html);
};

// Function to update the theme based on user preference
const updateTheme = () => {
    // Check if dark mode is preferred
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    // Determine the theme based on dark mode preference
    const theme = isDarkMode ? 'night' : 'day';
    // Set the theme value in the settings
    document.querySelector('[data-settings-theme]').value = theme;
    // Set CSS variables based on the theme
    document.documentElement.style.setProperty('--color-dark', isDarkMode ? '255, 255, 255' : '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', isDarkMode ? '10, 10, 20' : '255, 255, 255');
};

// Function to initialize the application
const initialize = () => {
    // Render initial books
    renderBooks(matches);
    // Render genre options
    renderOptions(genres, '[data-search-genres]', 'any', 'All Genres');
    // Render author options
    renderOptions(authors, '[data-search-authors]', 'any', 'All Authors');
    // Update theme based on user preference
    updateTheme();
};

// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initialize);

// Event listener for settings form submission
document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    // Get selected theme from form data
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    // Update theme based on user selection
    updateTheme(theme);
    // Close settings overlay
    document.querySelector('[data-settings-overlay]').open = false;
});

// Event listener for when the "Show more" button is clicked
document.querySelector('[data-list-button]').addEventListener('click', () => {
    // Create a document fragment to hold new preview elements
    const fragment = document.createDocumentFragment();

    // Iterate over the matches to render additional books for the next page
    for (const { author, id, image, title } of matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)) {
        // Create a preview element for each book
        const element = createPreviewElement({ author, id, image, title });
        // Append the element to the fragment
        fragment.appendChild(element);
    }

    // Append the new preview elements to the list items container
    document.querySelector('[data-list-items]').appendChild(fragment);
    // Increment the page number
    page += 1;
});

// Event listener for when a preview item is clicked
document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    // Find the clicked preview item in the event path
    const pathArray = Array.from(event.path || event.composedPath());
    let active = null;

    // Iterate over the path to find the preview item's data
    for (const node of pathArray) {
        if (active) break;

        if (node?.dataset?.preview) {
            let result = null;

            // Find the book data using the preview ID
            for (const singleBook of books) {
                if (result) break;
                if (singleBook.id === node?.dataset?.preview) result = singleBook;
            }

            active = result;
        }
    }

    // If a book is found, show its details in the overlay
    if (active) {
        document.querySelector('[data-list-active]').open = true;
        document.querySelector('[data-list-blur]').src = active.image;
        document.querySelector('[data-list-image]').src = active.image;
        document.querySelector('[data-list-title]').innerText = active.title;
        document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
        document.querySelector('[data-list-description]').innerText = active.description;
    }
});

// Event listener for closing the search overlay
document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false;
});

// Event listener for closing the settings overlay
document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false;
});

// Event listener for opening the search overlay
document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true;
    document.querySelector('[data-search-title]').focus();
});

// Event listener for opening the settings overlay
document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true;
});

// Event listener for closing the list overlay
document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false;
});

// Event listener for submitting the search form
document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    // Get form data
    const formData = new FormData(event.target);
    // Convert form data to object
    const filters = Object.fromEntries(formData);
    // Filter books based on search criteria
    const result = books.filter((book) => {
        let genreMatch = filters.genre === 'any';
        for (const singleGenre of book.genres) {
            if (genreMatch) break;
            if (singleGenre === filters.genre) {
                genreMatch = true;
            }
        }
        return (
            (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
            (filters.author === 'any' || book.author === filters.author) &&
            genreMatch
        );
    });

    // Update page and matches
    page = 1;
    matches = result;

    // Show message if no results found
    if (result.length < 1) {
        document.querySelector('[data-list-message]').classList.add('list__message_show');
    } else {
        document.querySelector('[data-list-message]').classList.remove('list__message_show');
    }

    // Render filtered books
    renderBooks(matches);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Close search overlay
    document.querySelector('[data-search-overlay]').open = false;
});
