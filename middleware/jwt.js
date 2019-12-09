const restify = require('restify')

/*
    Middleware that processes the request's jwt. Expects the following input function:
    (req) => Either(decrypted_token | err)
*/
const get_jwt_token_middleware = (processTokenFn) => {
    return (req, res, next) => {
        const decryptedTokenEither = processTokenFn(req)
        if(!decryptedTokenEither.isRight) {
            let err = restify.errors.InvalidCredentialsError("Invalid Credentials")
            err.context = decryptedTokenEither.value
            return next(err)
        } else {
            req.decryptedToken = decryptedTokenEither.value
            return next()
        }
    }
}

module.exports = {
    get_jwt_token_middleware
}