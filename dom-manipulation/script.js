// Initial array of quote objects
let quotes = [
    {
        text: "The only way to do great work is to love what you do.",
        category: "Work",
    },
    {
        text: "Strive not to be a success, but rather to be of value.",
        category: "Value",
    },
    {
        text: "The mind is everything. What you think you become.",
        category: "Mind",
    },
    {
        text: "Life is what happens when you're busy making other plans.",
        category: "Life",
    },
];

// --- Core Display Functions ---

/**
 * Generates and displays a random quote from the 'quotes' array.
 */
function showRandomQuote() {
    const displayElement = document.getElementById("quoteDisplay");

    // Check if there are quotes to display
    if (quotes.length === 0) {
        displayElement.innerHTML = "<p>No quotes available. Add one!</p>";
        return;
    }

    // 1. Get a random quote index
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    // 2. Clear previous content (Advanced DOM Manipulation: innerHTML replacement)
    displayElement.innerHTML = "";

    // 3. Create elements for the quote text and category
    const quoteText = document.createElement("p");
    quoteText.className = "quote-text";
    quoteText.textContent = quote.text;

    const quoteCategory = document.createElement("p");
    quoteCategory.className = "quote-category";
    quoteCategory.textContent = `— ${quote.category}`;

    // 4. Append elements to the display container
    displayElement.appendChild(quoteText);
    displayElement.appendChild(quoteCategory);
}

// --- Dynamic Form Creation ---

/**
 * Creates and displays the form for adding a new quote and category dynamically.
 */
function createAddQuoteForm() {
    const formContainer = document.getElementById("formContainer");
    // Clear the button placeholder
    formContainer.innerHTML = "";

    // 1. Create the main form container div
    const formDiv = document.createElement("div");
    formDiv.id = "addQuoteForm";
    formDiv.innerHTML = "<h3>Add New Quote</h3>";

    // 2. Create Quote Text Input
    const textInput = document.createElement("input");
    textInput.setAttribute("id", "newQuoteText");
    textInput.setAttribute("type", "text");
    textInput.setAttribute("placeholder", "Enter a new quote");

    // 3. Create Category Input
    const categoryInput = document.createElement("input");
    categoryInput.setAttribute("id", "newQuoteCategory");
    categoryInput.setAttribute("type", "text");
    categoryInput.setAttribute("placeholder", "Enter quote category");

    // 4. Create Add Quote Button
    const addButton = document.createElement("button");
    addButton.textContent = "Add Quote";
    // Attach the addQuote function to the button click event
    addButton.addEventListener("click", addQuote);

    // 5. Append all new elements to the form container
    formDiv.appendChild(textInput);
    formDiv.appendChild(categoryInput);
    formDiv.appendChild(addButton);

    // 6. Append the formDiv to the main container
    formContainer.appendChild(formDiv);
}

// --- Dynamic Quote Addition Logic ---

/**
 * Reads form input, adds a new quote to the array, updates the display,
 * and rebuilds the form button.
 */
function addQuote() {
    const textInput = document.getElementById("newQuoteText");
    const categoryInput = document.getElementById("newQuoteCategory");
    const formContainer = document.getElementById("formContainer");

    const newText = textInput.value.trim();
    const newCategory = categoryInput.value.trim();

    if (newText && newCategory) {
        // 1. Add new quote object to the array
        quotes.push({ text: newText, category: newCategory });

        // 2. Provide feedback (optional)
        alert(`New quote added! Category: ${newCategory}`);

        // 3. Clear inputs and replace form with the original button
        formContainer.innerHTML = "";
        const showFormButton = document.createElement("button");
        showFormButton.setAttribute("id", "showFormButton");
        showFormButton.textContent = "Add New Quote & Category";
        showFormButton.addEventListener("click", createAddQuoteForm);
        formContainer.appendChild(showFormButton);
    } else {
        alert("Please enter both a quote and a category.");
    }
}

// --- Initialization: Event Listeners ---

document.addEventListener("DOMContentLoaded", () => {
    // 1. Event listener for the "Show New Quote" button
    const newQuoteButton = document.getElementById("newQuote");
    newQuoteButton.addEventListener("click", showRandomQuote);

    // 2. Event listener for the initial "Show Form" button
    const showFormButton = document.getElementById("showFormButton");
    showFormButton.addEventListener("click", createAddQuoteForm);

    // Display the first random quote on load
    showRandomQuote();
});
