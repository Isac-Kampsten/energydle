require 'sinatra'
require 'slim'
require 'sqlite3'
require 'bcrypt'
require 'sinatra/reloader'
require 'json'

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
