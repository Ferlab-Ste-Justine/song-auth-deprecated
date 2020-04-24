const R = require('ramda')
const errors = require('restify-errors')

const check_body = R.curry((querySchema, logger, preprocessor = null) => (req, res, next) => {
    if(preprocessor) {
        try {
            const body = preprocessor(req.body)
        } catch(err) {
            logger.info({
                'event': 'incoming_request',
                'method': req.method,
                'url': req.url,
                'validation': 'failed while preprocessing',
                'error': err
            })
            return next(new errors.BadRequestError('Body could not be processed'))
        }
    } else {
        const body = req.body
    }
    const validation = querySchema.validate(req.body);
    if(!validation.error) {
        logger.info({
            'event': 'incoming_request',
            'method': req.method,
            'url': req.url,
            'validation': 'passed'
        })
        return next()
    } else {
        logger.info({
            'event': 'incoming_request',
            'method': req.method,
            'url': req.url,
            'validation': 'failed',
            'error': validation.error
        })
        return next(new errors.BadRequestError(validation.error))
    }
})

module.exports = {
    check_body
}