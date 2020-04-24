const R = require('ramda')
const request = require('request-promise-native')
const errors = require('request-promise-native/errors');
const restify_errors = require('restify-errors')

const fill_samples_metadata = R.curry((samples_metadata_service, logger) => {
    return (req, res, next) => {
        const body = req.body
        const sampleSubmitterIdRequests = R.compose(
            R.map((sampleSubmitterId) => request(
                `${samples_metadata_service}/studies/${body.studyId}/samples/with-submitter-id/${sampleSubmitterId}/song-metadata`
            )),
            R.map(R.prop('submitterSampleId')),
            R.prop('samples')
        )(body)
        Promise.all(sampleSubmitterIdRequests).then((samples) => {
            logger.debug({
                'event': 'fill_samples_metadata',
                'method': req.method,
                'url': req.url,
                'status': 'success'
            })
            const filledBody = R.mergeAll([body, { samples }])
            req.body = JSON.stringify(filledBody)
            next()
        }).catch(errors.StatusCodeError, function (reason) {
            logger.info({
                'event': 'fill_samples_metadata',
                'method': req.method,
                'url': req.url,
                'status': 'failure',
                'failure_type': 'non_200_return_code',
                'details': reason.message
            })
            //https://github.com/request/promise-core/blob/master/lib/errors.js#L22
            if(reason.statusCode>=400 && reason.statusCode<500) {
                next(new restify_errors.BadRequestError('Bad request'))
            } else {
                next(new restify_errors.InternalServerError('Could not resolve request'))
            }
        })
        .catch(errors.RequestError, function (reason) {
            logger.warn({
                'event': 'fill_samples_metadata',
                'method': req.method,
                'url': req.url,
                'status': 'failure',
                'failure_type': 'failure_to_reach_service',
                'reason': reason
            })
            next(new restify_errors.InternalServerError('Could not resolve request'))
        });
    }
})

module.exports = {
    fill_samples_metadata
}