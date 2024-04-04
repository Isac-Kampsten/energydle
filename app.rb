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
    # Example query: Fetch drink names matching the user input
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

    #logic to put it in guesses junction table
    #code
    #connect db
    db = SQLite3::Database.new('db/energydle.db')
    #get drink id from name
    drink_id = db.execute("SELECT id FROM Drinks WHERE Name LIKE ?", "%#{drink}%").first
    #insert recieved data
    db.execute("INSERT INTO Guesses (user_id, drink_id, guessed_at) VALUES (?,?,?)", session[:user_id], drink_id, date)

    #for testing purposes just puts in console
    puts "Recieved drink: #{drink}, date: #{date}"

    #return a succes response to the js file to let it know the request went through

    status 200
end