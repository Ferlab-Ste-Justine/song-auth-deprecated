const R = require('ramda')
const access_control_utils = require('./access_control')

test('Assert that admin access control works when access should be granted', () => {
    const decodedToken = {
        'realm_access': {
            'roles': ['yes', 'no', 'aktum', 'maybe']
        }
    }
    const is_aktum = access_control_utils.is_admin('aktum')
    expect(
        is_aktum(decodedToken)
    ).toBe(true)
})

test('Assert that admin access control works when access should be denied', () => {
    const decodedToken = {
        'realm_access': {
            'roles': ['yes', 'no', 'maybe']
        }
    }
    const decodedToken2 = {
        'realm_access': {}
    }
    const decodedToken3 = {}
    const is_aktum = access_control_utils.is_admin('aktum')
    
    expect(
        is_aktum(decodedToken)
    ).toBe(false)
    expect(
        is_aktum(decodedToken2)
    ).toBe(false)
    expect(
        is_aktum(decodedToken3)
    ).toBe(false)
})