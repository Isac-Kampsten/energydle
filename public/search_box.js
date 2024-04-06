document.addEventListener("DOMContentLoaded", function() {
    const inputBox = document.getElementById("input-box");
    const resultBox = document.querySelector(".result-box ul");
    const guessesBox = document.querySelector(".guesses-box")
    const searchButton = document.getElementById("search-button")
    
    searchButton.onclick = function(){
        add_guess(inputBox.value,Date.parse(Date()))
    };

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

    function add_guess(drink,date){
       fetch('add_guess',{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({drink: drink, date: date})
       })

       .then(response => {
        if (response.ok){
            console.log("Guess added");
        } else {
            console.log("Failed to add guess");
            inputBox.style.transition = "color 0.5s ease-out";
            inputBox.value = "You already guessed this one or perhaps you mispelled"
            inputBox.style.color = "red"

            setTimeout(() => {
                inputBox.style.color = "#333";
            }, 2000);
        }
       })

       .catch(error => console.error("Error adding guess:",error))

    }

});