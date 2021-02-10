const Sauce = require('../models/Sauce') //Importation du model Sauce pour créer la logique des routes
const fs = require('fs') //Package file system qui permet d'accèder aux opérations liées au système des fichiers


//Logique métier pour les routes

//Fonction pour créer une sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce) //On extrait l'objet JSON
    delete sauceObject._id
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`, //URL complète dynamique qui prend en compte multer pour les images
    })
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
        .catch(error => res.status(400).json({ error }))
}

//Fonction pour modifier une sauce déjà présente
exports.modifySauce = (req, res, next) => {
    //On crée un objet pour vérifier si l'image est également modifiée
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body }
    Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id }) //Objet de comparaison et la nouvelle version de l'Objet
        .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
        .catch(error => res.status(400).json({ error }))
}

//Fonction pour effacer une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) //Objet à effacer
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1] //On extrait le fichier image de la sauce à effacer
            fs.unlink(`images/${filename}`, () => { //fs.unlik efface le fichier image associé à la sauce
                Sauce.deleteOne({ _id: req.params.id }) //Puis on efface la sauce de la base des données
                    .then(() => res.status(200).json({ message: 'Sauce effacée !' }))
                    .catch(error => res.status(400).json({ error }))
            })
        })
        .catch(error => res.status(500).json({ error }))
}

//Fonction pour afficher une sauce séléctionnée
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }))
    req.params.id
}

//Fonction pour afficher TOUTES les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }))
}

// Function pour "like ou dislike" une sauce
exports.likeOrDislike = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            switch (req.body.like) {
                case -1: //utilisateur n'aime pas la sauce
                    Sauce.updateOne({ _id: req.params.id }, {
                            $inc: { dislikes: 1 },
                            $push: { usersDisliked: req.body.userId },
                            _id: req.params.id
                        })
                        .then(() => res.status(201).json({ message: "L'utilisateur n'aime pas la sauce !" }))
                        .catch(error => res.status(400).json({ error }))
                    break;

                case 0:
                    if (sauce.usersLiked.find(user => user === req.body.userId)) { //utilisateur n'aime plus la sauce (enlève son like)
                        Sauce.updateOne({ _id: req.params.id }, {
                                $inc: { likes: -1 },
                                $pull: { usersLiked: req.body.userId },
                                _id: req.params.id
                            })
                            .then(() => res.status(201).json({ message: "L'utilisateur n'aime plus la sauce !" }))
                            .catch(error => res.status(400).json({ error }))
                    }

                    if (sauce.usersDisliked.find(user => user === req.body.userId)) { //utilisateur aime finalement la sauce (enlève son dislike)
                        Sauce.updateOne({ _id: req.params.id }, {
                                $inc: { dislikes: -1 },
                                $pull: { usersDisliked: req.body.userId },
                                _id: req.params.id
                            })
                            .then(() => res.status(201).json({ message: "L'utilisateur enlève son dislike à la sauce !" }))
                            .catch(error => res.status(400).json({ error }))
                    }
                    break;

                case 1:
                    Sauce.updateOne({ _id: req.params.id }, { //Utilisateur aime la sauce
                            $inc: { likes: 1 },
                            $push: { usersLiked: req.body.userId },
                            _id: req.params.id
                        })
                        .then(() => res.status(201).json({ message: "L'utilisateur aime la sauce !" }))
                        .catch(error => res.status(400).json({ error }))
                    break;
                default:
                    return res.status(500).json({ error });
            }
        })
        .catch(error => res.status(500).json({ error }))
}