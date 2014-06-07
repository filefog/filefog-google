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
var Definition = require('../index.js');
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



winston.info('Testing `' + package.name + '`, a Filefog provider definition.');
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
    definition: Definition,

    // Default connection config to use.
    config: {
        client_key : '777041726477-a5o1tp6f3i9m1me3tj5vhpnrn1jge43c.apps.googleusercontent.com',
        client_secret : 'mWURYHmMKZxr6aeR7DTjRu-q',
        client_scope : "https://www.googleapis.com/auth/drive",
        redirect_url : 'http://localhost/'
    }


});
