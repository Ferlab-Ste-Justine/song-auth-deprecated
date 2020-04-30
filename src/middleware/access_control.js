const R = require('ramda')
const errors = require('restify-errors')

//Implementation details of flagging external access so that further middleware can check for it
//in an implementation-agnostic manner.
const flag_external_access = (logger) => {
    return (req, res, next) => {
        req.externalRequest = req.headers['x-external-request'] == "1"
        if(!req.externalRequest) {
            logger.info({
                'event': 'internal_request',
                'method': req.method,
                'url': req.url
            })  
        }
        return next()
    }
}

//processMiscAccessFn: (decrypted_jwt) => Either(true | err)
const access_misc_resource = R.curry((processMiscAccessFn, proxyReqFn, logger) => {
    return (req, res, next) => {
        if(!req.externalRequest) {
            proxyReqFn(req, res)
            return
        }
        const access = processMiscAccessFn(req.decryptedToken)
        if(access.isRight) {
            logger.info({
                'access': 'misc',
                'granted': true
            })
            proxyReqFn(req, res)
        } else {
            let err = new errors.ForbiddenError("Not Authorized to Access Resource")
            err.body.context = access.value
            logger.info({
                'access': 'misc',
                'granted': false,
                'context': access.value
            })
            return next(err)
        }
    }
})

//Access: {jwt: ..., accessType: read|write, study: ...}
//processStudyAccessFn: (Access) =>  => Either(true | err)
const access_study_resource = R.curry((accessType, processStudyAccessFn, proxyReqFn, logger) => {
    return (req, res, next) => {
        if(!req.externalRequest) {
            proxyReqFn(req, res)
            return
        }
        const access = processStudyAccessFn({
            'jwt': req.decryptedToken,
            'accessType': accessType,
            'study': req.params.studyId
        })
        if(access.isRight) {
            logger.info({
                'access': 'study',
                'type': accessType,
                'study': req.params.studyId,
                'granted': true
            })
            proxyReqFn(req, res)
        } else {
            let err = new errors.ForbiddenError("Not Authorized to Access Resource")
            err.body.context = access.value
            logger.info({
                'access': 'study',
                'type': accessType,
                'study': req.params.studyId,
                'granted': false,
                'context': access.value
            })
            return next(err)
        }
    }
})

module.exports = {
    access_misc_resource,
    access_study_resource,
    flag_external_access
}