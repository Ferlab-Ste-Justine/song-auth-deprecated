const R = require('ramda')
const request = require('request-promise-native')
var errors = require('request-promise-native/errors');

const fill_samples_metadata = R.curry((samples_metadata_service, logger) => {
    return (req, res, next) => {
        const body = JSON.parse(req.body)
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
            res.status(reason.statusCode).send(reason.error)
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
            res.status(500).send('Could not resolve request')
        });
    }
})

module.exports = {
    fill_samples_metadata
}