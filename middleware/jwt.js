const get_jwt_token_middleware = (processTokenFn) => {
    return (req, res, next) => {
        const decryptedTokenEither = processTokenFn(req)
        if(!decryptedTokenEither.isRight) {
            return next(decryptedTokenEither.value)
        } else {
            req.decryptedToken = decryptedTokenEither.value
            return next()
        }
    }
}

module.exports = {
    get_jwt_token_middleware
}