const multer = require('multer') //Package pour gérér les fichiers

//Types de fichier acceptés par le frontend
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images') //On séléctionne le dossier où on va stocker les images

    },
    //On genère le nouvel nom du fichier
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_') //On remplace les spaces du nom pour éviter des erreurs et on les remplace par des undescores
        const extension = MIME_TYPES[file.mimetype] //On crée l'extension du fichier qui correspond au Mimetype envoyé par le frontend
        callback(null, name + Date.now() + '.' + extension) //Le nom du fichier avec un typestamp et l'extension du fichier
    }
})

module.exports = multer({ storage }).single('image') //Méthode multer auquel on passe l'objet storage et on indique que c'est un seul fichier