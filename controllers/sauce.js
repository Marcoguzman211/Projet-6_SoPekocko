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


/*{
    try {
        const sauceInJson = JSON.parse(req.body.sauce); // On parse le JSON
        delete sauceInJson._id; // Si il y a un _id, on le supprime
        for (let index in sauceInJson) { // On parcours le l'objet
            sauceInJson[index] = mongoSanitize(protectToXss(sauceInJson[index])); // Et on remplace chaque élément par un identique néttoyer et protéger des attaques xss
        }
        const sauce = new Sauce({ // On construit l'objet en mettant certaines valeurs à zero
            ...sauceInJson,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            likes: 0,
            dislikes: 0,
            usersLiked: [],
            usersDisliked: []
        });
        sauce.save() // On peut le sauvegarder
            .then(() => res.status(201).json({ message: "Sauce ajoutée" })) // Si tout s'est bien passé, on mets un statut 201 et on renvoi un message de succès
            .catch((error) => res.status(500).json({ error: new Error(error) })); // Sinon on considère que la requête est incorrect et on renvoi un statut 400
    } catch (error) {
        res.status(400).json({ error: new Error(error) });
    }
} */



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

/* exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }))
} */

exports.getAllSauces = (req, res) => {
    Sauce.find() // On récupère toute les sauces
        .then((sauces) => {
            res.status(200).json(sauces); // Lorsqu'on les a, on mets un statut 200 et on envoi le json
        })
        .catch((error) => { // On cas d'erreur, on considère que le problème vient du serveur et on renvoi un statut 500 avec l'erreur
            res.status(500).json({
                error: new Error(error),
            });
        });
}