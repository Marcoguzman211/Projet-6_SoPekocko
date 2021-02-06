const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')

const stuffRoutes = require('./routes/stuff')
const userRoutes = require('./routes/user')

//Connexion à la base de données
mongoose.connect('mongodb+srv://userpekocko:2BD0xaee86GESevJ@cluster0.jyz8d.mongodb.net/<dbname>?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB Atlas réussie !'))
    .catch(() => console.log('Connexion à MongoDB Atlas échouée !'));

const app = express()
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next()
})

app.use(bodyParser.json())
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use('/api/stuff', stuffRoutes)
app.use('/api/auth', userRoutes)


module.exports = app