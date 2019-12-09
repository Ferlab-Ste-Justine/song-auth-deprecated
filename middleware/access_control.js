const restify = require('restify')

const access_misc_resource = (processMiscAccessFn, proxyReqFn) => {
    return (req, res, next) => {
        const access = processMiscAccessFn(req.decryptedToken)
        if(access.isRight) {
            proxyReqFn(req, rest)
        } else {
            let err = restify.errors.NotAuthorizedError("Not Authorized to Access Resource")
            err.context = access.value
            return next(err)
        }
    }
}

module.exports = {
    access_misc_resource
}