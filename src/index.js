//Library dependencies
const R = require('ramda')
const restify = require('restify')
const http_proxy = require('http-proxy')
const Either = require('data.either')
const jwt = require('@cr-ste-justine/jwt')

//Internal dependencies
const access_control_utils = require('./utils/access_control')
const jwtMiddleware = require('./middleware/jwt')
const accessControlMiddleware = require('./middleware/access_control')
const configs = require('./config')
const proxy = require('./proxy')
const logger = require('./logger')

//Parametrization of higher order utility functions

const is_admin = access_control_utils.is_admin(configs.adminRole)
const access_study = access_control_utils.access_study(
    is_admin,
    //For now the check to access study when not admin is set to always true
    R.T
)
const proxy_request_to_song = proxy.proxy_request(configs.songService)

//Parametrization of higher order middleware generating functions 

const accessMiscResourceMiddleware = accessControlMiddleware.access_misc_resource(
    access_control_utils.process_resource_access(
        is_admin,
        access_control_utils.generate_misc_access_err
    ),
    proxy_request_to_song,
    logger.accessControlLogger
)

const accessStudyResourceMiddleware = accessControlMiddleware.access_study_resource(
    R.__,
    access_control_utils.process_resource_access(
        access_study,
        access_control_utils.generate_study_access_err
    ),
    proxy_request_to_song,
    logger.accessControlLogger
)

const readStudyResourceMiddleware = accessStudyResourceMiddleware('read')
const writeStudyResourceMiddleware = accessStudyResourceMiddleware('write')

const get_current_time_in_seconds = () => Math.round( new Date().getTime() / 1000 )

const getJwtTokenMiddleware = jwtMiddleware.get_jwt_token_middleware(
    jwt.process_request_token(
        jwt.get_token_from_header,
        configs.jwtSecret,
        Either.Right,
        jwt.check_token_expiry(R.prop('expiry'), get_current_time_in_seconds)
    ),
    logger.authenticationLogger
)

//Routing

var server = restify.createServer()

//GET /swagger-ui.html
//Get swagger docs
server.get(
    '/swagger-ui.html',
    proxy_request_to_song
)
server.get(
    '/webjars/springfox-swagger-ui/*',
    proxy_request_to_song
)
server.get(
    '/swagger-resources',
    proxy_request_to_song
)
server.get(
    '/swagger-resources/configuration/*',
    proxy_request_to_song
)
server.get(
    '/v2/api-docs',
    proxy_request_to_song
)

//GET /isAlive
//Checks if the server is running
server.get(
    '/isAlive',
    proxy_request_to_song
)

//GET /studies/{studyId}/analysis
//Retrieve all analysis objects for a studyId
server.get(
    '/studies/:studyId/analysis',
    getJwtTokenMiddleware,
    readStudyResourceMiddleware
)

//PUT /studies/{studyId}/analysis/{analysisId}
//Update dynamic-data for for an analysis
server.put(
    '/studies/:studyId/analysis/:analysisId',
    getJwtTokenMiddleware,
    writeStudyResourceMiddleware
)

//GET /studies/{studyId}/analysis/{id}
//Retrieve the analysis object for an analysisId
server.get(
    '/studies/:studyId/analysis/:id',
    getJwtTokenMiddleware,
    readStudyResourceMiddleware
)

//GET /studies/{studyId}/analysis/{id}/files
//Retrieve the file objects for an analysisId
server.get(
    '/studies/:studyId/analysis/:id/files',
    getJwtTokenMiddleware,
    readStudyResourceMiddleware
)

//PUT /studies/{studyId}/analysis/publish/{id}
//Publish an analysis. This checks to see if the files associated with the input analysisId exist in the storage server
server.put(
    '/studies/:studyId/analysis/publish/:id',
    getJwtTokenMiddleware,
    writeStudyResourceMiddleware
)

//GET /studies/{studyId}/analysis/search/id
//Search for analysis objects by specifying regex patterns for the donorIds, sampleIds, specimenIds, or fileIds request parameters
server.get(
    '/studies/:studyId/analysis/search/id',
    getJwtTokenMiddleware,
    readStudyResourceMiddleware
)

//POST /studies/{studyId}/analysis/search/id
//Search for analysis objects by specifying an IdSearchRequest
server.post(
    '/studies/:studyId/analysis/search/id',
    getJwtTokenMiddleware,
    writeStudyResourceMiddleware
)

//PUT /studies/{studyId}/analysis/suppress/{id}
//Suppress an analysis. Used if a previously published analysis is no longer needed. Instead of removing the analysis, it is marked as “suppressed”
server.put(
    '/studies/:studyId/analysis/suppress/:id',
    getJwtTokenMiddleware,
    writeStudyResourceMiddleware
)

//PUT /studies/{studyId}/analysis/unpublish/{id}
//Unpublish an analysis. Set the analysis status to unpublished
server.put(
    '/studies/:studyId/analysis/unpublish/:id',
    getJwtTokenMiddleware,
    writeStudyResourceMiddleware
)

//GET /studies/{studyId}/donors/{id}
//Retrieves donor data for a donorId
server.get(
    '/studies/:studyId/donors/:id',
    getJwtTokenMiddleware,
    readStudyResourceMiddleware
)

//DELETE /studies/{studyId}/donors/{ids}
//Deletes donor data and all dependent specimens and samples for donorIds
server.del(
    '/studies/:studyId/donors/:ids',
    getJwtTokenMiddleware,
    writeStudyResourceMiddleware
)

//GET /export/analysis/{analysisIds}
//Exports the payload for a list of analysisIds
server.get(
    '/export/analysis/:analysisIds',
    getJwtTokenMiddleware,
    accessMiscResourceMiddleware
)

//GET /export/studies/{studyId}
//Exports all the payloads for a study
server.get(
    '/export/studies/:studyId',
    getJwtTokenMiddleware,
    readStudyResourceMiddleware
)

//GET /studies/{studyId}/files/{id}
//Retrieves file data for a fileId
server.get(
    '/studies/:studyId/files/:id',
    getJwtTokenMiddleware,
    readStudyResourceMiddleware
)

//PUT /studies/{studyId}/files/{id}
//Updates file data for a fileId
server.put(
    '/studies/:studyId/files/:id',
    getJwtTokenMiddleware,
    writeStudyResourceMiddleware
)

//DELETE /studies/{studyId}/files/{ids}
//Deletes file data for fileIds
server.del(
    '/studies/:studyId/files/:ids',
    getJwtTokenMiddleware,
    writeStudyResourceMiddleware
)

//GET /entities
//Page through LegacyEntity data
server.get(
    '/entities',
    getJwtTokenMiddleware,
    accessMiscResourceMiddleware
)

//GET /entities/{id}
//Read entity data for a legacy entity id
server.get(
    '/entities/:id',
    getJwtTokenMiddleware,
    accessMiscResourceMiddleware
)

//GET /studies/{studyId}/samples/{id}
//Retrieves sample data for a sampleId
server.get(
    '/studies/:studyId/samples/:id',
    getJwtTokenMiddleware,
    readStudyResourceMiddleware
)

//DELETE /studies/{studyId}/samples/{ids}
//Deletes sample data for sampleIds
server.del(
    '/studies/:studyId/samples/:ids',
    getJwtTokenMiddleware,
    writeStudyResourceMiddleware
)

//GET /schemas
//Retrieves a list of registered analysisTypes
server.get(
    '/schemas',
    getJwtTokenMiddleware,
    accessMiscResourceMiddleware
)

//POST /schemas
//Registers an analysisType schema
server.post(
    '/schemas',
    getJwtTokenMiddleware,
    accessMiscResourceMiddleware
)


//GET /schemas/{name}
//Retrieves the latest version of a schema for an analysisType
server.get(
    '/schemas/:name',
    getJwtTokenMiddleware,
    accessMiscResourceMiddleware
)

//GET /schemas/meta
//Retrieves the meta-schema used to validate AnalysisType schemas
server.get(
    '/schemas/meta',
    getJwtTokenMiddleware,
    accessMiscResourceMiddleware
)

//GET /studies/{studyId}/specimens/{id}
//Retrieves specimen data for a specimenId
server.get(
    '/studies/:studyId/specimens/:id',
    getJwtTokenMiddleware,
    readStudyResourceMiddleware
)

//DELETE /studies/{studyId}/specimens/{ids}
//Deletes specimen data and all dependent samples for specimenIds
server.del(
    '/studies/:studyId/specimens/:ids',
    getJwtTokenMiddleware,
    writeStudyResourceMiddleware
)

//GET /studies/{studyId}
//Retrieves information for a study
server.get(
    '/studies/:studyId',
    getJwtTokenMiddleware,
    readStudyResourceMiddleware
)

//POST /studies/{studyId}/
//Creates a new study
server.post(
    '/studies/:studyId/',
    getJwtTokenMiddleware,
    writeStudyResourceMiddleware
)

//GET /studies/{studyId}/all
//Retrieves all donor, specimen and sample data for a study
server.get(
    '/studies/:studyId/all',
    getJwtTokenMiddleware,
    readStudyResourceMiddleware
)

//GET /studies/all
//Retrieves all studyIds
server.get(
    '/studies/all',
    getJwtTokenMiddleware,
    accessMiscResourceMiddleware
)

//POST /upload/{studyId}
//Synchronously submit a json payload
server.post(
    '/submit/:studyId',
    getJwtTokenMiddleware,
    writeStudyResourceMiddleware
)

//POST /upload/{studyId}/force
//Forcefully submit a json payload, ignoring analysisId collisions
server.post(
    '/submit/:studyId/force',
    getJwtTokenMiddleware,
    writeStudyResourceMiddleware
)

//Server launch

server.listen(configs.servicePort, function() {
    console.log('%s listening at %s', server.name, server.url)
})