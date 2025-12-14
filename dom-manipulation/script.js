// Initial quotes (used only if local storage is empty)
const defaultQuotes = [
  {
    text: "The only way to do great work is to love what you do.",
    category: "Work",
  },
  {
    text: "Strive not to be a success, but rather to be of value.",
    category: "Value",
  },
  {
    text: "The best way to predict the future is to create it.",
    category: "Future",
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    category: "Life",
  },
];

// Global array to hold quotes
let quotes = [];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const quoteFormContainer = document.getElementById("quoteFormContainer");
const exportQuotesButton = document.getElementById("exportQuotes");
const lastQuoteDisplay = document.getElementById("lastQuoteDisplay");

// =========================================================
// Step 1: Web Storage Functions (Local & Session)
// =========================================================

/**
 * Loads quotes from local storage or initializes with default quotes.
 */
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    try {
      quotes = JSON.parse(storedQuotes);
    } catch (e) {
      console.error("Error parsing quotes from local storage:", e);
      quotes = defaultQuotes;
    }
  } else {
    quotes = defaultQuotes;
  }
}

/**
 * Saves the current quotes array to local storage.
 */
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

/**
 * Saves the currently displayed quote to session storage.
 * @param {object} quote - The quote object to store.
 */
function saveLastViewedQuote(quote) {
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
  updateLastViewedDisplay();
}

/**
 * Retrieves and displays the last viewed quote from session storage.
 */
function updateLastViewedDisplay() {
  const lastQuote = sessionStorage.getItem("lastViewedQuote");
  if (lastQuote) {
    const quoteObj = JSON.parse(lastQuote);
    lastQuoteDisplay.textContent = `Last viewed quote (Session): "${quoteObj.text.substring(
      0,
      40
    )}..."`;
  } else {
    lastQuoteDisplay.textContent = "No session quote viewed yet.";
  }
}

// =========================================================
// Main Application Functions
// =========================================================

/**
 * Displays a random quote from the quotes array in the DOM.
 */
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available. Add some!</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  // Clear previous content
  quoteDisplay.innerHTML = "";

  // Create the quote text element
  const quoteTextElement = document.createElement("p");
  quoteTextElement.className = "quote-text";
  quoteTextElement.textContent = `"${quote.text}"`;

  // Create the category element
  const categoryElement = document.createElement("p");
  categoryElement.className = "quote-category";
  categoryElement.textContent = `Category: ${quote.category}`;

  // Append new elements to the display container
  quoteDisplay.appendChild(quoteTextElement);
  quoteDisplay.appendChild(categoryElement);

  // Step 1: Save the displayed quote to session storage
  saveLastViewedQuote(quote);
}

/**
 * Creates and injects the dynamic form for adding new quotes.
 */
function createAddQuoteForm() {
  // Only create if the container is empty
  if (quoteFormContainer.childElementCount > 0) return;

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.className = "form-input";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.className = "form-input";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.className = "form-button";

  addButton.addEventListener("click", addQuote);

  // Append elements
  quoteFormContainer.appendChild(textInput);
  quoteFormContainer.appendChild(document.createElement("br"));
  quoteFormContainer.appendChild(categoryInput);
  quoteFormContainer.appendChild(document.createElement("br"));
  quoteFormContainer.appendChild(addButton);
}

/**
 * Handles the logic for adding a new quote to the array.
 */
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document
    .getElementById("newQuoteCategory")
    .value.trim();

  if (newQuoteText && newQuoteCategory) {
    // Add the new quote
    quotes.push({
      text: newQuoteText,
      category: newQuoteCategory,
    });

    // Step 1: Save to local storage after adding
    saveQuotes();

    // Clear the input fields
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    alert(`Quote added successfully! Total quotes: ${quotes.length}`);
    showRandomQuote();
  } else {
    alert("Please enter both quote text and a category.");
  }
}

// =========================================================
// Step 2: JSON Import and Export Functions
// =========================================================

/**
 * Exports the current quotes array to a JSON file and triggers a download.
 */
function exportToJsonFile() {
  if (quotes.length === 0) {
    alert("No quotes to export!");
    return;
  }

  const dataStr = JSON.stringify(quotes, null, 2); // Pretty-print JSON
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // Create a temporary link element for the download
  const link = document.createElement("a");
  link.href = url;
  link.download = `quotes_export_${new Date().toISOString().slice(0, 10)}.json`;

  // Programmatically click the link to start the download
  document.body.appendChild(link);
  link.click();

  // Clean up the temporary link and URL
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  alert("Quotes exported successfully!");
}

/**
 * Imports quotes from a JSON file selected by the user.
 * @param {Event} event - The file input change event.
 */
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileReader = new FileReader();

  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);

      // Validate if imported data is an array
      if (!Array.isArray(importedQuotes)) {
        alert(
          "Import failed: JSON file content is not a valid array of quotes."
        );
        return;
      }

      // Simple validation for quote objects
      const validQuotes = importedQuotes.filter((q) => q.text && q.category);

      if (validQuotes.length === 0) {
        alert("Import failed: No valid quotes found in the file.");
        return;
      }

      // Merge the new quotes into the existing array
      quotes.push(...validQuotes);

      // Save the updated array to local storage
      saveQuotes();

      alert(
        `Successfully imported ${validQuotes.length} quotes! Total quotes: ${quotes.length}`
      );
      showRandomQuote();
    } catch (e) {
      alert("Import failed: Invalid JSON file format.");
      console.error("JSON parsing error:", e);
    }
    // Clear the file input value so the same file can be imported again if needed
    event.target.value = "";
  };

  fileReader.onerror = function () {
    alert("Error reading file.");
  };

  fileReader.readAsText(file);
}

// Attach the global import function to the window scope
window.importFromJsonFile = importFromJsonFile;

// =========================================================
// Initialization and Event Listeners
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  // Step 1: Load existing quotes from local storage
  loadQuotes();

  // Step 1: Update session storage display
  updateLastViewedDisplay();

  // Generate the Add Quote form
  createAddQuoteForm();

  // Show an initial random quote
  showRandomQuote();
});

// Event Listeners:
newQuoteButton.addEventListener("click", showRandomQuote);
exportQuotesButton.addEventListener("click", exportToJsonFile);
