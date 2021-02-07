const Sauce = require('../models/Sauce')
const fs = require('fs')


exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce)
    delete sauceObject._id
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    })
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
        .catch(error => res.status(400).json({ error }))
}

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body }
    Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
        .catch(error => res.status(400).json({ error }))
}

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1]
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce effacée !' }))
                    .catch(error => res.status(400).json({ error }))
            })
        })
        .catch(error => res.status(500).json({ error }))
}

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }))
    req.params.id
}

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