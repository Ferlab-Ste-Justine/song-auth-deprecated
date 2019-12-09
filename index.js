const R = require('ramda')
const restify = require('restify')
const http_proxy = require('http-proxy')

const generic_utils = require('./utils/generic')
const jwt_utils = require('./utils/jwt')
const access_control_utils = require('./utils/access_control')
const monad_utils = require('./utils/monad')
const jwtMiddleware = require('./middleware/jwt')
const accessControlMiddleware = require('./middleware/access_control')
const configs = require('./config')
const proxy = require('./proxy')

var server = restify.createServer()

const get_current_time_in_seconds = () => Math.round( new Date().getTime() / 1000 )

server.use(
    jwtMiddleware.get_jwt_token_middleware(
        jwt_utils.process_request_token(
            jwt_utils.get_token_from_header,
            configs.jwtSecret,
            generic_utils.either_right_identity,
            jwt_utils.check_token_expiry(R.prop('expiry'), get_current_time_in_seconds)
        )
    )
)

server.use(
    accessControlMiddleware.access_misc_resource(
        access_control_utils.process_resource_access(
            access_control_utils.is_admin('clin_administrator'),
            access_control_utils.generate_misc_access_err
        )
    ),
    proxy.proxy_request(configs.songService)
)

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url)
})