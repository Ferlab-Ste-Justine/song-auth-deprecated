const R = require('ramda')
const Either = require('data.either')

class MiscAccessError extends Error {
    constructor(message) {
        super(message)
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor)
    }
}

const generate_misc_access_err = () => new MiscAccessError("Access to miscallaneous resource denied")

/*
    Higher order function that given a key for the admin role, returns a function that tests whether 
    a jwt has the admin role
    Signature:
        (admin_role) => ( (jwt) => true | false ) 
*/
const is_admin = (adminRole) => R.compose(
    R.ifElse(
        R.isNil,
        R.F,
        R.compose(
            R.not,
            R.isNil,
            R.find(R.equals(adminRole))
        )
    ),
    R.path(['realm_access', 'roles'])
)

const access_study = R.curry((jwt, studyID) => {})

/*
    Higher order function that, given a function that checks from a decrypted token if the user
    has access to a given resource, returns a function that check if a user has access to the
    resource returning an error or success wrapped in an Either monad.
    Signature:
    ((decrypted_token) => true | false) => ( (decrypted_token) => Either(true | MiscAccessError) )
*/
const process_resource_access = R.curry((resourceAccessFn, errFn) => {
    return R.ifElse(
        resourceAccessFn,
        R.compose(Either.Right, R.T),
        R.compose(Either.Left, errFn)
    )
})

module.exports = {
    is_admin,
    access_study,
    process_resource_access,
    generate_misc_access_err
}