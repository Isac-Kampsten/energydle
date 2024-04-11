require 'sinatra'
require 'slim'
require 'sqlite3'
require 'bcrypt'
require 'sinatra/reloader'
require 'json'

enable :sessions

get('/') do
    slim(:welcome)
end

get('/home') do
    slim(:home)
end

get('/register') do
    slim(:register)
end

get('/login') do
    slim(:login)
end

get('/classic') do
    slim(:classic)
end

post('/users/new') do
    username = params[:username]
    password = params[:password]
    password_confirm = params[:password_confirm]

    if password == password_confirm
        #lägg till användare
        password_digest = BCrypt::Password.create(password)
        db = SQLite3::Database.new('db/energydle.db')
        db.execute('INSERT INTO users (username, pwdigest) VALUES (?,?)',username,password_digest)
        redirect('/')
    else
        #felhantering
        #gör snyggare med typ error slim fil som ges
        "Lösenorden matchade inte"
    end
end

post('/login') do
    username = params[:username]
    password = params[:password]
    db = SQLite3::Database.new('db/energydle.db')
    db.results_as_hash = true
    result = db.execute("SELECT * FROM users WHERE username = ?",username).first
    pwdigest = result["pwdigest"]
    id = result["id"]

    if BCrypt::Password.new(pwdigest) == password
        session[:user_id] = id
        session[:username] = username
        redirect('/home')
    else
        "Fel lösenord"
    end
end

# Route for fetching suggestions based on user input
post('/search') do
    content_type :json # Set response content type to JSON
    input_value = JSON.parse(request.body.read)['input'] # Parse input value from request body
    db = SQLite3::Database.new('db/energydle.db')
    db.results_as_hash = true
    # Look for drinks like the input in db
    drinks = db.execute("SELECT Name FROM Drinks WHERE Name LIKE ?", "%#{input_value}%")
    drinks.map { |drink| drink['Name'] }.to_json # Convert result to JSON and return
end

#Route to update guesses junction table
# This route handler receives the fetch request and saves the data

post('/add_guess') do
    #request.body.rewind
    data = JSON.parse(request.body.read)
    drink = data["drink"]
    date = data["date"]
    already_guessed = false

    #logic to put it in guesses junction table
    #code
    #connect db
    db = SQLite3::Database.new('db/energydle.db')
    #get drink id from name
    drink_id = db.execute("SELECT id FROM Drinks WHERE Name LIKE ?", "%#{drink}%").first.first

    #check if user has already guessed this drink

    already_guessed_drinks = db.execute("SELECT drink_id FROM Guesses WHERE user_id LIKE ?", session[:user_id])
    
    #if already guessed drinks are empty then we're clear to execute
    if already_guessed_drinks.first == nil
        p "added cuz empty"
        db.execute("INSERT INTO Guesses (user_id, drink_id, guessed_at) VALUES (?,?,?)", session[:user_id], drink_id,date)    
    else
        #go through every guessed drink and see if the current one already been guessed by this user
        already_guessed_drinks.each do |drink|

            if drink_id == drink.first
                already_guessed = true
            end
    
        end
    end

    if already_guessed == false && already_guessed_drinks.first != nil
        #this drink have not been guessed by this user and can be added to db
        db.execute("INSERT INTO Guesses (user_id, drink_id, guessed_at) VALUES (?,?,?)", session[:user_id], drink_id, date)
        p "this drink was not guessed and is now added"
        status 200

    elsif already_guessed == true
        #this drink has already been guessed
        p "you already guessed this"
        status 500
    end

end

get('/check_for_correct_drink_update') do

    db = SQLite3::Database.new('db/energydle.db')
    lastUpdate = db.execute("SELECT time_added from correct_drink").first.first

    lastUpdate.to_s

end

post('/update_correct_drink') do

    data = JSON.parse(request.body.read)
    new_drink = data['input'] # Parse input value from request body
    new_drink_date = data['date']

    db = SQLite3::Database.new('db/energydle.db')

    #delete everything from guesses table
    db.execute("DELETE FROM Guesses")
    
    #update the drink and date
    db.execute("UPDATE correct_drink SET id = ?, time_added = ?",new_drink,new_drink_date)
end

get('/get_drinks') do

    db = SQLite3::Database.new('db/energydle.db')
    drink_arrays = db.execute("SELECT id from Drinks")
    current_correct_drink = db.execute("SELECT id from correct_drink").first.first
    drinks = drink_arrays.map(&:first) # Extract first element from each array

    #FIX LATER, REMOVE DRINK THAT'S CURRENTLY THE CORRECT DRINK FROM ARRAY
    drinks.each_with_index do |element, index|
        if element == current_correct_drink
            drinks.delete_at(index)
        end
    end

    drinks.to_json # Convert array to JSON and return
end

get('/get_guesses') do

    db = SQLite3::Database.new('db/energydle.db')

    guessed_drinks = db.execute("SELECT drink_id,guessed_at FROM Guesses WHERE user_id = ?",session[:user_id])

    guessed_drinks.to_json
end

get('/get_correct_drink_attributes') do

    db = SQLite3::Database.new('db/energydle.db')

    correct_drink_id = db.execute("SELECT id FROM correct_drink")

    correct_drink_attr = db.execute("SELECT * FROM Drinks WHERE id = ?",correct_drink_id).first
    correct_drink_attr.pop()

    correct_drink_attr.to_json


end

get('/get_guessed_drink_attributes') do
    drink_id = params['drinkId'][0]

    db = SQLite3::Database.new('db/energydle.db')

    guessed_drink_attr = db.execute("SELECT * FROM Drinks WHERE id = ?",drink_id).first
    guessed_drink_attr.pop()

    guessed_drink_attr.to_json
end