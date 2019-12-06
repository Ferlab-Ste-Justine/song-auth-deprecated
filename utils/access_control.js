const R = require('ramda')

/*
    Higher order function that given a key for the admin role, returns a function that tests whether 
    a jwt has the admin role
    Signature:
        (admin_role) => ( (jwt) => true | false ) 
*/
const is_admin = (admin_role) => R.compose(
    R.ifElse(
        R.isNil,
        R.F,
        R.compose(
            R.not,
            R.isNil,
            R.find(R.equals(admin_role))
        )
    ),
    R.path(['realm_access', 'roles'])
)

const can_access_study = R.curry((jwt, studyID) => {})

module.exports = {
    is_admin,
    can_access_study
}