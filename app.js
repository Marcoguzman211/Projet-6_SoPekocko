const express = require('express') //On importe express
const bodyParser = require('body-parser') //Package pour transformer le corps des requêtes 
const mongoose = require('mongoose')
const path = require('path')
const helmet = require('helmet')
const dotenv = require('dotenv') //.env pour sécuriser l'accès à la base de données

const sauceRoutes = require('./routes/sauce')
const userRoutes = require('./routes/user')

dotenv.config() //Elle initie dotenv and rend les variables disponibles pour la connexion MongoDb

//Connexion à la base de données MongoDb Atlas
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.jyz8d.mongodb.net/SoPekocko?retryWrites=true&w=majority`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB Atlas réussie !'))
    .catch(() => console.log('Connexion à MongoDB Atlas échouée !'));

const app = express() //Constante qui éxécute Express

app.use(helmet()) //middleware Helmet pour les attaques XSS 

//Ajout des Headers à la requête pour éviter le CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next()
})

app.use(bodyParser.json()) //On met les réponses des requêtes HTTP en format JSON exploitable
app.use('/images', express.static(path.join(__dirname, 'images'))) //Serve un dossier static qui nous permet d'accèder aux images ajoutées

app.use('/api/auth', userRoutes) //Pour la route on utilise le routeur passé en deuxième argument
app.use('/api/sauces', sauceRoutes) //Pour la route on utilise le routeur passé en deuxième argument


module.exports = app