exports.provider = require('./lib/provider.js');
exports.client = require('./lib/client.js');
exports.transform = require('./lib/transform.js');
exports.config = {
    "interfaces" : ["oauth","events"],
    "client_scope": "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.email"
}