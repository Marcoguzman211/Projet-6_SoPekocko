const express = require('express')
const router = express.Router() //Création du routeur express pour les Users
const useCtrl = require('../controllers/user') //Pour associer les controlleurs pour les diféréntes routes

router.post('/signup', useCtrl.signup)
router.post('/login', useCtrl.login)

module.exports = router //Exporte la logige du routeur pour app.js