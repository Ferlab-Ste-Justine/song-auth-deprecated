const R = require('ramda')

const check_body = R.curry((querySchema, logger, preprocessor = null) => (req, res, next) => {
    if(preprocessor) {
        try {
            const body = preprocessor(req.body)
        } catch(err) {
            logger.info({
                'event': 'incoming_request',
                'method': req.method,
                'url': req.url,
                'validation': 'failed',
                'error': validation.error
            })
            res.status(400).send(validation.error)
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
        next()
    } else {
        logger.info({
            'event': 'incoming_request',
            'method': req.method,
            'url': req.url,
            'validation': 'failed',
            'error': validation.error
        })
        res.status(400).send(validation.error)
    }
})

module.exports = {
    check_body
}