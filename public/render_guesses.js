let renderedGuesses = new Array();


function renderGuesses() {
    const guess_box = document.getElementById("guesses_box")
    fetch("/get_guesses")
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch drinks');
            }
            return response.json(); // Parse response as JSON
        })
        .then(data => {  
            if (data.length == 0) {
                console.log(data)
                console.log("no drinks to render")
            } else {
                // First figure out most recently guessed drink
                guessedDrink = getMostRecentlyAddedDrink(data);
                var MostRecentlyAddedDrink = data[data.length-1];

                if (renderedGuesses.includes(MostRecentlyAddedDrink[0])) {
                    // Do nothing
                    //console.log("already rendered");
                    //console.log(renderedGuesses)
                } else {
                    // Get correct drink attributes
                    fetch("/get_correct_drink_attributes")
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to fetch correct drink attributes');
                            }
                            return response.json(); // Parse response as JSON
                        })
                        .then(correct_drink_attr => {
                            // Get drink attributes from guessed drinks that just were received
                            fetch(`/get_guessed_drink_attributes?drinkId=${MostRecentlyAddedDrink}`)
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error('Failed to fetch correct drink attributes');
                                    }
                                    return response.json(); // Parse response as JSON
                                })
                                .then(guessed_drink_attr => {
                                    // Render
                                    render(correct_drink_attr, guessed_drink_attr, guess_box);
                                    renderedGuesses.push(MostRecentlyAddedDrink[0])
                                });
                        })
                        .catch(error => {
                            console.error('Error fetching drink attributes:', error);
                        });
                }
            }
        })
        .catch(error => {
            console.error('Error fetching guesses:', error);
        });
}  

function render(correct_drink_attributes, guessed_drink_attributes, guess_box) {
    // Clear the guess_box content before rendering new attributes
    //guess_box.innerHTML = '';
    console.log(guessed_drink_attributes[0] == correct_drink_attributes[0])


    // Create the outer div with class "guess"
    const outerDiv = document.createElement('div');
    outerDiv.classList.add('guess');

    // Iterate over the attributes and create the inner divs and paragraphs
    correct_drink_attributes.forEach((attribute, index) => {
        // Create a new div element
        const div = document.createElement('div');

        // Create a new paragraph element
        const p = document.createElement('p');

        // Set the text content of the paragraph element
        p.textContent = guessed_drink_attributes[index];

        //change colors based on matches

        //if the name is correct everything should be green, OBS! LATER ADD won = 1 or something bombclat
        if (guessed_drink_attributes[0] == correct_drink_attributes[0]){
            div.style.backgroundColor = "green";
        } else if (correct_drink_attributes[1] == guessed_drink_attributes[1] && index == 1){ //OBS DETTA KÖRS HELA TIDEN FIXA SÅ ATT DEN KOLLAR INDEX OCKSÅ MED && STATEMENT
            div.style.backgroundColor = "green";
        } else if (index == 2){
            //first check if its the exact flavor/flavors
            

            if (correct_drink_attributes[2] == guessed_drink_attributes[2]){
                div.style.backgroundColor = "yellow";
            } else{
                //split guessed drinks different flavors into an array and then use include() on the correct drinks flavors

                let splitted_flavors_guessed = guessed_drink_attributes[2].split(",").map(item => item.trim());
                let splitted_flavors_correct = correct_drink_attributes[2].split(",").map(item => item.trim());
                let containsFlavor = null;

                splitted_flavors_guessed.forEach(item =>{
                    if (splitted_flavors_correct.includes(item)){
                        containsFlavor = true;
                    }
                });
                

                if (containsFlavor == true){
                    div.style.backgroundColor = "yellow";
                }else{
                    div.style.backgroundColor = "red";
                }
            }


        }


        // Append the paragraph element to the div element
        div.appendChild(p);

        // Append the div element to the outer div
        outerDiv.appendChild(div);
    });

    // Append the outer div to the guess_box
    console.log(guess_box)
    guess_box.appendChild(outerDiv);
}

function getMostRecentlyAddedDrink(arrayOfArrays) {
    // Initialize variables to store the maximum date and the corresponding array
    let maxDate = Number.MIN_SAFE_INTEGER;
    let maxArray = null;

    // Iterate through the array of arrays
    arrayOfArrays.forEach(array => {
        // Check if the second element (date) of the current array is greater than the maximum date
        if (array[1] > maxDate) {
            // Update the maximum date and the corresponding array
            maxDate = array[1];
            maxArray = array;
        }
    });

    return maxArray[0]; // Return the array with the most recent date
}

setInterval(renderGuesses, 5000);
