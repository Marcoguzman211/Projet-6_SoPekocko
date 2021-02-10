const bcrypt = require('bcrypt') //Package de cryptage des mots de passe
const { json } = require('body-parser')
const jwt = require('jsonwebtoken') //Package pour générer des tokens encodés
const CryptoJS = require("crypto-js") //Package de cryptage des adresses mail
const User = require('../models/User') //Importation du model User
const userValidator = require('./userValidator') //Importation du fichier userValidator pour valider le format du mot de passe

exports.signup = (req, res, next) => {
    if (userValidator.isGoodPassword(req.body.password)) {
        bcrypt.hash(req.body.password, 10) //On crypte de mot de passe et nous retourne un hash
            .then(hash => {
                //Creation d'un nouvel user
                const user = new User({
                    email: CryptoJS.HmacSHA1(req.body.email, "Key").toString(), //Hash du email inséré par l'utilisateur
                    password: hash //Mot de passe ecrypté
                })
                user.save() //Function pour enregistrer dans la base des données
                    .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                    .catch(error => res.status(400).json({ error }))
            })
            .catch(error => res.status(500).json({ error }))
    } else {
        return res.status(400).json({ message: 'Le mot de passe doit contenir au moins un nombre, une majuscule et être composé de 6 caractères minimun' })
    }
}

//Permet aux utilisateur existants de se connecter
exports.login = (req, res, next) => {
    let emailUser = CryptoJS.HmacSHA1(req.body.email, "Key").toString() //Encryptage du email inséré pour pouvoir le rechercher
    User.findOne({ email: emailUser }) //Une fois crypté, on le recherche dans la base des données
        .then(user => {
            if (!user) { //Si on trouve pas d'User on envoie une erreur
                return res.status(401).json({ error: 'Utilisateur non trouvé !' })
            }
            bcrypt.compare(req.body.password, user.password) //On compare les mots de passe insérés et celui du user trouvé
                .then(valid => {
                    if (!valid) { //Si le client insère un mauvais mot de passe on renvoie une erreur
                        return res.status(401).json({ error: 'Mot de passe incorrect !' })
                    }
                    res.status(200).json({ //Si tout se passe bien on renvoie les infos et on laisse se connecter
                        userId: user._id,
                        token: jwt.sign({ userId: user._id }, //Token encodé pour vérifier que l'User s'est bien identifié
                            'RANDOM_TOKEN_SECRET', { expiresIn: '24h' }
                        )
                    })
                })
                .catch(error => res.status(500).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
}