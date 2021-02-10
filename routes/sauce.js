const express = require('express')
const router = express.Router() //Création du routeur express pour les sauces

const sauceCtrl = require('../controllers/sauce') //Importation du controlleur sauce.js
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config') //Middleware pour la gestion des images

router.post('/', auth, multer, sauceCtrl.createSauce) //Traite les requêtes post pour créer des sauces avec multer pour gérér les images
router.put('/:id', auth, multer, sauceCtrl.modifySauce) //Modifie une sauce existante avec multer pour gérér les images
router.delete('/:id', auth, sauceCtrl.deleteSauce) //Requete pour effacer une sauce
router.get('/:id', auth, sauceCtrl.getOneSauce) //Requête pour afficher une sauce séléctionnée
router.get('/', auth, sauceCtrl.getAllSauces) //Affiche toutes les sauces
router.post('/:id/like', auth, sauceCtrl.likeOrDislike) //Traite les requêtes post pour liker ou disliker les sauces

module.exports = router //Exporte la logige du routeur pour app.js