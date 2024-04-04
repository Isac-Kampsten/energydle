document.addEventListener("DOMContentLoaded", function() {
    const inputBox = document.getElementById("input-box");
    const resultBox = document.querySelector(".result-box ul");

    inputBox.addEventListener("input", function() {
        const inputValue = inputBox.value.trim();
        resultBox.innerHTML = ""; // Clear previous suggestions
        if (inputValue.length > 0) {
            fetchSuggestions(inputValue);
        }
    });

    function fetchSuggestions(inputValue) {
        fetch("/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ input: inputValue })
        })
        .then(response => response.json())
        .then(data => {
            // Generate HTML elements for suggestions based on data received
            data.forEach(drink => {
                const suggestion = document.createElement("li");
                suggestion.textContent = drink;

                suggestion.onclick = function(){
                    inputBox.value = drink
                };

                resultBox.appendChild(suggestion);
            });
        })
        .catch(error => console.error("Error fetching suggestions:", error));
    }
});