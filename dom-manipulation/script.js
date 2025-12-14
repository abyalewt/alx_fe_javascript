// =========================================================
// Global Configuration
// =========================================================

// Global array to hold quotes
let quotes = [];

// Simulate a server endpoint to fetch initial/synced data
const SERVER_DATA_URL = "https://jsonplaceholder.typicode.com/posts?_limit=5";
const SYNC_INTERVAL = 30000; // Sync every 30 seconds (30000ms)

// Initial/Fallback quotes (used only if local storage is empty and server fails)
const defaultQuotes = [
  {
    text: "The only way to do great work is to love what you do.",
    category: "Work",
    id: "local-1",
  },
  {
    text: "Strive not to be a success, but rather to be of value.",
    category: "Value",
    id: "local-2",
  },
  {
    text: "The best way to predict the future is to create it.",
    category: "Future",
    id: "local-3",
  },
];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const quoteFormContainer = document.getElementById("quoteFormContainer");
const exportQuotesButton = document.getElementById("exportQuotes");
const lastQuoteDisplay = document.getElementById("lastQuoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const syncButton = document.getElementById("syncButton");
const syncStatus = document.getElementById("syncStatus");

// =========================================================
// Web Storage Functions (Local & Session)
// =========================================================

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

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function saveLastViewedQuote(quote) {
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
  updateLastViewedDisplay();
}

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
// Step 1: Simulate Server Interaction (New Function)
// =========================================================

/**
 * Fetches data from the simulated server and converts it to quote format.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of quote objects.
 */
async function fetchQuotesFromServer() {
  const response = await fetch(SERVER_DATA_URL);
  if (!response.ok) {
    throw new Error(`Server response not OK (Status: ${response.status})`);
  }

  const serverPosts = await response.json();

  // Map server posts (id, title, body) into quote objects (id, text, category)
  const serverQuotes = serverPosts.map((post) => ({
    // Capitalize the title and add a period for quote appearance
    text: post.title.charAt(0).toUpperCase() + post.title.slice(1) + ".",
    // Assign a category based on the userId for variety
    category: post.userId % 2 === 0 ? "Server-A" : "Server-B",
    id: `server-${post.id}`,
  }));

  return serverQuotes;
}

// =========================================================
// Step 2 & 3: Syncing and Conflict Resolution (Updated)
// =========================================================

function displayStatus(message, success = true) {
  syncStatus.textContent = message;
  syncStatus.style.display = "block";
  syncStatus.classList.remove("status-success");

  if (success) {
    syncStatus.classList.add("status-success");
  }

  setTimeout(() => {
    syncStatus.style.display = "none";
    syncStatus.classList.remove("status-success");
  }, 5000);
}

/**
 * Executes the data sync process: fetches server data, resolves conflicts, and saves locally.
 */
async function syncData() {
  displayStatus("Syncing data with server...", false);
  syncButton.disabled = true;
  let localQuoteCount = quotes.length;
  let mergeCount = 0;

  try {
    const serverQuotes = await fetchQuotesFromServer(); // Call the new function

    // --- Conflict Resolution Strategy: Server Data Takes Precedence ---

    const localQuoteMap = quotes.reduce((map, quote) => {
      map[quote.id] = quote;
      return map;
    }, {});

    // 1. Iterate through server quotes and merge/replace local data
    serverQuotes.forEach((serverQuote) => {
      const index = quotes.findIndex((q) => q.id === serverQuote.id);

      if (index !== -1) {
        // Conflict: IDs match. Server takes precedence (replace local version).
        quotes[index] = serverQuote;
        mergeCount++;
      } else {
        // No conflict: New quote from server. Add it.
        quotes.push(serverQuote);
      }
    });

    // 2. Save the merged data
    saveQuotes();

    // 3. Update UI
    populateCategories();
    filterQuotes();

    let message = `Sync successful! ${quotes.length} total quotes. `;
    if (mergeCount > 0) {
      message += `${mergeCount} server updates merged.`;
    } else if (quotes.length > localQuoteCount) {
      message += `Added ${quotes.length - localQuoteCount} new quotes.`;
    }

    displayStatus(message, true);
  } catch (error) {
    console.error("Data Sync Error:", error);
    displayStatus(
      `Sync failed. Using local data. Error: ${error.message}`,
      false
    );
  } finally {
    syncButton.disabled = false;
  }
}

// =========================================================
// Filtering Logic
// =========================================================

function populateCategories() {
  const allCategories = quotes.map((quote) => quote.category);
  const uniqueCategories = [...new Set(allCategories)];

  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  uniqueCategories.sort().forEach((category) => {
    if (category) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    }
  });
}

function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("lastSelectedFilter", selectedCategory);

  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter((quote) => quote.category === selectedCategory);

  quoteDisplay.innerHTML = "";

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes found for category: ${selectedCategory}.</p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  const quoteTextElement = document.createElement("p");
  quoteTextElement.className = "quote-text";
  quoteTextElement.textContent = `"${quote.text}"`;

  const categoryElement = document.createElement("p");
  categoryElement.className = "quote-category";
  categoryElement.textContent = `Category: ${quote.category}`;

  quoteDisplay.appendChild(quoteTextElement);
  quoteDisplay.appendChild(categoryElement);

  saveLastViewedQuote(quote);
}

function restoreFilter() {
  const lastFilter = localStorage.getItem("lastSelectedFilter");
  if (lastFilter) {
    if (
      Array.from(categoryFilter.options).some(
        (option) => option.value === lastFilter
      )
    ) {
      categoryFilter.value = lastFilter;
    }
  }
}

// =========================================================
// Quote Management Functions
// =========================================================

function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document
    .getElementById("newQuoteCategory")
    .value.trim();

  if (newQuoteText && newQuoteCategory) {
    // Create a unique local ID for the new quote
    const newQuote = {
      text: newQuoteText,
      category: newQuoteCategory,
      id: `local-${Date.now()}`, // Use timestamp for a unique local ID
    };

    quotes.push(newQuote);

    saveQuotes();
    populateCategories();

    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    displayStatus(
      `Local quote added: ${newQuote.category}. Sync to save permanently.`,
      false
    );

    filterQuotes();
  } else {
    alert("Please enter both quote text and a category.");
  }
}

function createAddQuoteForm() {
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

  quoteFormContainer.appendChild(textInput);
  quoteFormContainer.appendChild(document.createElement("br"));
  quoteFormContainer.appendChild(categoryInput);
  quoteFormContainer.appendChild(document.createElement("br"));
  quoteFormContainer.appendChild(addButton);
}

// =========================================================
// JSON Import and Export Functions
// =========================================================

function exportToJsonFile() {
  if (quotes.length === 0) {
    alert("No quotes to export!");
    return;
  }
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `quotes_export_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  displayStatus("Quotes exported successfully!", true);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (!Array.isArray(importedQuotes)) {
        alert(
          "Import failed: JSON file content is not a valid array of quotes."
        );
        return;
      }
      const validQuotes = importedQuotes.filter((q) => q.text && q.category);
      quotes.push(...validQuotes);

      saveQuotes();
      populateCategories();

      displayStatus(
        `Successfully imported ${validQuotes.length} quotes!`,
        true
      );
      filterQuotes();
    } catch (e) {
      displayStatus("Import failed: Invalid JSON file format.", false);
      console.error("JSON parsing error:", e);
    }
    event.target.value = "";
  };
  fileReader.readAsText(file);
}

// Attach global functions
window.importFromJsonFile = importFromJsonFile;
window.filterQuotes = filterQuotes;

// =========================================================
// Initialization and Event Listeners
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initial Load
  loadQuotes();
  populateCategories();
  restoreFilter();
  updateLastViewedDisplay();
  createAddQuoteForm();
  filterQuotes();

  // 2. Attach Sync Event Listener
  syncButton.addEventListener("click", syncData);

  // 3. Implement Periodic Sync
  setInterval(syncData, SYNC_INTERVAL);

  // Initial sync check on load
  syncData();
});

// Other Event Listeners:
newQuoteButton.addEventListener("click", filterQuotes);
exportQuotesButton.addEventListener("click", exportToJsonFile);
