const R = require('ramda')
const config_utils = require('./config')
const monad_utils = require('./monad')

const configs = {
    'test': 'test_val',
    'test2': '{"a": 1, "b": 2}',
    'test3': ', "b": 2}'
}

const get_config = (key) => {
    return {'key': key, 'val': R.prop(key, configs)}
}

const load_mandatory_str_config = config_utils.load_mandatory_str_config(get_config)
const load_optional_str_config = config_utils.load_optional_str_config(get_config, () => "fallback")
const load_mandatory_json_config = config_utils.load_mandatory_json_config(get_config)

test('Assert that getting a mandatory string config works with the happy path', () => {
    expect(
        R.compose(
            monad_utils.get_value,
            load_mandatory_str_config
        )('test')
    ).toBe('test_val')
})

test('Assert that getting a mandatory string config works with failure', () => {
    expect(
        R.compose(
            monad_utils.get_value,
            load_mandatory_str_config
        )('test99')
    ).toBeInstanceOf(config_utils.ConfigUndefinedError)
})

test('Assert that getting an optional string config works with the happy path', () => {
    expect(
        load_optional_str_config('test')
    ).toBe('test_val')
})

test('Assert that getting an optional string config works with the fallback value', () => {
    expect(
        load_optional_str_config('test99')
    ).toBe('fallback')
})

test('Assert that getting a mandatory json config works with the happy path', () => {
    expect(
        R.compose(
            monad_utils.get_value,
            load_mandatory_json_config
        )('test2')
    ).toEqual({"a": 1, "b": 2})
})

test('Assert that getting a mandatory json config works with failure', () => {
    expect(
        R.compose(
            monad_utils.get_value,
            load_mandatory_json_config
        )('test99')
    ).toBeInstanceOf(config_utils.ConfigUndefinedError)

    expect(
        R.compose(
            monad_utils.get_value,
            load_mandatory_json_config
        )('test3')
    ).toBeInstanceOf(config_utils.ConfigMalformatedError)
})