const R = require('ramda')
const errors = require('restify-errors')

//processMiscAccessFn: (decrypted_jwt) => Either(true | err)
const access_misc_resource = R.curry((processMiscAccessFn, proxyReqFn) => {
    return (req, res, next) => {
        const access = processMiscAccessFn(req.decryptedToken)
        if(access.isRight) {
            proxyReqFn(req, res)
        } else {
            let err = new errors.ForbiddenError("Not Authorized to Access Resource")
            err.body.context = access.value
            return next(err)
        }
    }
})

//Access: {jwt: ..., accessType: read|write, study: ...}
//processStudyAccessFn: (Access) =>  => Either(true | err)
const access_study_resource = R.curry((accessType, processStudyAccessFn, proxyReqFn) => {
    return (req, res, next) => {
        const access = processStudyAccessFn({
            'jwt': req.decryptedToken,
            'accessType': accessType,
            'study': req.params.studyId
        })
        if(access.isRight) {
            proxyReqFn(req, res)
        } else {
            let err = new errors.ForbiddenError("Not Authorized to Access Resource")
            err.body.context = access.value
            return next(err)
        }
    }
})

module.exports = {
    access_misc_resource,
    access_study_resource
}