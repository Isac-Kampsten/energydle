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
        
        //get correct drink attributes 

        //get drink attributes from guessed drinks that just were recieved then call render to create html elements

    })
    .catch(error => {
        console.error('Error fetching guesses:', error);
    });
}

function render(){
    //render
}

setInterval(renderGuesses, 5000);
