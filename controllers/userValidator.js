module.exports = {
    isGoodPassword: input => {
        // Au moins 6 caractères, au moins un nombre, une minuscule, une majuscule
        let regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/
        return regex.test(input)
    }
}