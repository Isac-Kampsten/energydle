function checkForUpdate(){
    // Make an AJAX request to check if it's been more than x amount of minutes
    fetch('/check_for_correct_drink_update')
    .then(response => {
        if (response.ok) {
            // If the response is successful (status code 200-299), parse the integer value
            return response.text(); // Convert the response body to text
        } else {
            // If the response is not successful, throw an error
            throw new Error('Failed to fetch data');
        }
    })
    .then(intValue => {
        // Parse the integer value (assuming it's a string representation of an integer)
        const lastUpdate = parseInt(intValue, 10);
        
        // check if it needs to be updated
        if ((Date.parse(Date()) - lastUpdate) > 60000){
            
            console.log("It's been over a minute since correct drink was updated, update it now")
            
            fetch('/get_drinks') // Fetch drinks from the server
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch drinks');
                    }
                    return response.json(); // Parse response as JSON
                })
                .then(data => {
                    // Now 'data' contains the array of drinks
                    console.log(data);
                })
                .catch(error => {
                    console.error('Error fetching drinks:', error);
                });


            //NOW JUST CHOOSE A RANDOM ID FROM THIS FETCHED ARRAY AND MAKE A POST REQUEST THAT FIRST DELETES EVERYTHING IN
            // THE CORRET_DRINK TABLE AND THEN INSERTS THIS NEW DRINK AS WELL AS THE CURRENT TIME

        }else{
            console.log("no need for update")
        }
    })
    .catch(error => {
        // Handle errors, such as network errors or failed responses
        console.error('Error:', error);
    });
}

//delete current correct drink and insert random new one from fetched drinks


//fetch all drinks and put them in an array


setInterval(checkForUpdate, 8000)