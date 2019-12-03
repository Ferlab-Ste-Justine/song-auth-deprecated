const get_jwt_token_middleware = (processTokenFn) => {
    return (req, res, next) => {
        const decryptedTokenEither = processTokenFn(req)
        if(!decryptedTokenEither.isRight) {
            return next(decryptedTokenEither.value)
        } else {
            request.decryptedToken = decryptedTokenEither.value
            return next()
        }
    }
}