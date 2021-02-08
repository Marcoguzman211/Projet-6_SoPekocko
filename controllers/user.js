const bcrypt = require('bcrypt')
const { json } = require('body-parser')
const jwt = require('jsonwebtoken')
const CryptoJS = require("crypto-js")
const User = require('../models/User')
const userValidator = require('./userValidator')

exports.signup = (req, res, next) => {
    if (userValidator.isGoodPassword(req.body.password)) {
        bcrypt.hash(req.body.password, 10)
            .then(hash => {
                const user = new User({
                    email: CryptoJS.HmacSHA1(req.body.email, "Key").toString(), //Hash du email inséré par l'utilisateur
                    password: hash
                })
                user.save()
                    .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                    .catch(error => res.status(400).json({ error }))
            })
            .catch(error => res.status(500).json({ error }))
    } else {
        return res.status(400).json({ message: 'Le mot de passe doit contenir au moins un nombre, une majuscule et être composé de 6 caractères minimun' })
    }
}

exports.login = (req, res, next) => {
    let emailUser = CryptoJS.HmacSHA1(req.body.email, "Key").toString() //Variable pour comparer l'email avec celui de la base de données
    User.findOne({ email: emailUser })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' })
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' })
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign({ userId: user._id },
                            'RANDOM_TOKEN_SECRET', { expiresIn: '24h' }
                        )
                    })
                })
                .catch(error => res.status(500).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
}