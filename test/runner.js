/**
 * Run integration tests
 *
 * Uses the `filefog-provider-tests` module to
 * run mocha tests against the appropriate version
 * of Filefog.
 */


/**
 * Module dependencies
 */

var mocha = require('mocha');
var TestRunner = require('filefog-provider-tests');
var Provider = require('../index.js');
var winston = require('winston');


// Grab targeted interfaces from this adapter's `package.json` file:
var package = {}
try {
    package = require('../package.json');
} catch (e) {
    throw new Error(
            '\n' +
            'Could not read package.json :: ' + '\n' +
            util.inspect(e)
    );
}



winston.info('Testing `' + package.name + '`, a Filefog provider.');
winston.info('Running `filefog-provider-tests`... ');
winston.log();



/**
 * Integration Test Runner
 *
 * Uses the `waterline-adapter-tests` module to
 * run mocha tests against the specified interfaces
 * of the currently-implemented Waterline adapter API.
 */
new TestRunner({

    // Mocha opts
    mocha: {
        bail: true
    },

    // Load the provider module.
    provider: Provider,

    // Default connection config to use.
    config: {
        host: 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: 'sailspg',
        port: 5432,
        schema: true,
        ssl: false
    }


});
