// Global variable to store IDs of rendered guesses
let renderedGuesses = new Set();
    
    function renderGuesses() {
        fetch("/get_guesses")
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch drinks');
            }
            return response.json(); // Parse response as JSON
        })

        .then(data=>{
            console.log(data)
            
            
            if (data.length == 0){
                console.log("no drinks to render")
            }else{

                //first figure out most recently guessed drink

                guessedDrink = getMostRecentlyAddedDrink(data)
                console.log("most recently guessed drink: " + guessedDrink)

                //get correct drink attributes

                fetch("/get_correct_drink_attributes")

                //get drink attributes from guessed drinks that just were recieved then call render to create html elements
            }

            
            

        })
        .catch(error => {
            console.error('Error fetching guesses:', error);
        });
    }

    function render(){
        //render
    }

    function getMostRecentlyAddedDrink(arrayOfArrays){
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
