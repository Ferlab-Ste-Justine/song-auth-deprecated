const R = require('ramda');

const generic_utils = require('../utils/generic')
const jwt_utils = require('../utils/jwt')
const monad_utils = require('../utils/monad')
const configs = require('./configs')
const jwtMiddleware = require('./middleware/jwt')

var server = restify.createServer();

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


//Throwaway logic to have something that runs for now
function respond(req, res, next) {
    res.send('hello ' + req.params.name);
    next();
}
  
server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});