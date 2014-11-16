var q = require('q')
    , request = require('request')
    , googleapis = require('googleapis')
    , extend = require('node.extend');

/**
 * Description
 * @method Client
 * @return 
 */
var Client = function () {

    //TODO: this is not required;
    //if (!this.credentials)
        //throw new FFParameterRejected("oauth_data cannot be null")

    var OAuth2Client = googleapis.auth.OAuth2;
    this._oauth2Client = new OAuth2Client(this.config.client_key, this.config.client_secret, this.config.redirect_url);
    this._oauth2Client.credentials = this.credentials;

    this._googleClientPromise = null;
};

/**
 * Description
 * @method accountInfo
 * @param {} options
 * @return CallExpression
 */
Client.prototype.accountInfo = function (options) {
    var self = this;
    return self._getClient().then(function (client) {
        options = extend({includeSubscribed: true, auth: self._oauth2Client}, options || {});
        var deferred = q.defer();
        client.about
            .get(options, function (err, result) {
                if (err) return deferred.reject(err);
                return deferred.resolve(result);
            });
        return deferred.promise;
    })
};

/**
 * Description
 * @method checkQuota
 * @param {} options
 * @return CallExpression
 */
Client.prototype.checkQuota = function (options) {
    var self = this;
    return self._getClient().then(function (client) {
        options = extend({includeSubscribed: true, auth: self._oauth2Client}, options || {});
        var deferred = q.defer();
        client.about
            .get(options, function (err, result) {
                if (err) return deferred.reject(err);
                return deferred.resolve(result);
            });
        return deferred.promise;
    })
};

/**
 * Description
 * @method createFile
 * @param {String} fileName
 * @param {String} parentIdentifier
 * @param {Object} content_buffer
 * @param {Object} options
 * @return CallExpression
 */
Client.prototype.createFile = function (fileName, parentIdentifier, content_buffer, options) {
    var self = this;

    return self._getClient().then(function (client) {
        options = extend({
            resource: {
                title: fileName
            },
            auth: self._oauth2Client,
            media: {
                mimeType: 'application/binary',
                body: content_buffer
            }
        }, options || {});

        if (parentIdentifier) {
            options.resource.parents =  [];
            options.resource.parents.push({"kind": "drive#fileLink","id":parentIdentifier})
        }

        var deferred = q.defer();
        client.files
            .insert(options,function (err, result) {
                if (err) return deferred.reject(err);
                return deferred.resolve(result);
            });
        return deferred.promise;
    })
};

/**
 * Description
 * @method updateFile
 * @param {String} identifier
 * @param {Buffer} content_buffer
 * @param {Object} options
 * @return CallExpression
 */
Client.prototype.updateFile = function (identifier, content_buffer, options) {
    var self = this;

    return self._getClient().then(function (client) {
        options = extend({
            fileId: identifier,
            auth: self._oauth2Client,
            media: {
                mimeType: 'application/binary',
                body: content_buffer
            }
        }, options || {});


        var deferred = q.defer();
        client.files
            .update(options,function (err, result) {
                if (err) return deferred.reject(err);
                return deferred.resolve(result);
            });
        return deferred.promise;
    })
};

/**
 * Description
 * @method deleteFile
 * @param {String} identifier
 * @return CallExpression
 */
Client.prototype.deleteFile = function (identifier) {
    var self = this;
    return self._getClient().then(function (client) {

        var deferred = q.defer();
        client.files
            .delete({ fileId: identifier, auth: self._oauth2Client }, function (err, result) {
                if (err) return deferred.reject(err);
                return deferred.resolve(result);
            });
        return deferred.promise;
    })
};

/**
 * Description
 * @method downloadFile
 * @param {String} identifier
 * @return CallExpression
 */
Client.prototype.downloadFile = function (identifier) {
    var self = this;
    return self.getFileInformation(identifier,{},{transform:false}).then(function(meta_data){
        var deferred = q.defer();
        request.get(
            {
                headers: {
                    'Authorization': 'Bearer ' + self.credentials.access_token
                },
                url: meta_data.downloadUrl,
                encoding: null /*forces the content to be sent back in binary form, body will always be a buffer.*/
            },
            function (err, r, body) {
                if (err) return deferred.reject(err);
                return deferred.resolve({ "headers": r.headers, "data": body});
            }
        );
        return deferred.promise;
    })
};

/**
 * Description
 * @method getFileInformation
 * @param {String} identifier
 * @return CallExpression
 */
Client.prototype.getFileInformation = function (identifier) {
    var self = this;
    identifier = identifier ||'root';
    return self._getClient().then(function (client) {
        var options = {fileId: identifier,auth: self._oauth2Client};

        var deferred = q.defer();
        client.files
            .get(options, function (err, result) {
                if (err) return deferred.reject(err);
                return deferred.resolve(result);
            });
        return deferred.promise;
    })
};

/**
 * Description
 * @method updateFileInformation
 * @param {String} identifier
 * @param {String} fileName
 * @param {String} parentIdentifier
 * @param {Object} options
 * @return CallExpression
 */
Client.prototype.updateFileInformation = function (identifier, fileName, parentIdentifier, options) {
    var self = this;
    identifier = identifier ||'root';
    return self._getClient().then(function (client) {
        options = extend({
            fileId: identifier,
            auth: self._oauth2Client,
            resource: {}
        }, options || {});

        if(fileName && !options.resource.title){
            options.resource.title = fileName;
        }
        if(parentIdentifier && !options.resource.parents){
            options.resource.parents = [];
            options.resource.parents.push({"kind": "drive#fileLink","id":parentIdentifier})
         }

        var deferred = q.defer();
        client.files
            .patch(options, function (err, result) {
                if (err) return deferred.reject(err);
                return deferred.resolve(result);
            });
        return deferred.promise;
    })
};


/**
 * Description
 * @method createFolder
 * @param {} folderName
 * @param {} parentIdentifier
 * @param {} options
 * @return CallExpression
 */
Client.prototype.createFolder = function (folderName, parentIdentifier, options) {
    var self = this;

    return self._getClient().then(function (client) {
        options = extend({
            resource:{
                title: folderName,
                mimeType : "application/vnd.google-apps.folder"
            },
            media:{
                mimeType : "application/vnd.google-apps.folder"
            },
            auth: self._oauth2Client}, options || {});

        if (parentIdentifier) {
            options.resource.parents = [];
            options.resource.parents.push({"kind": "drive#fileLink","id":parentIdentifier})
        }

        var deferred = q.defer();
        client.files
            .insert(options, function (err, result) {
                if (err) return deferred.reject(err);
                return deferred.resolve(result);
            });
        return deferred.promise;
    })
};

Client.prototype.deleteFolder = Client.prototype.deleteFile;

Client.prototype.getFolderInformation = Client.prototype.getFileInformation;

/**
 * Description
 * @method retrieveFolderItems
 * @param {} identifier
 * @param {} options
 * @return CallExpression
 */
Client.prototype.retrieveFolderItems = function (identifier,options) {
    var self = this;

    return self._getClient().then(function (client) {
        identifier = identifier ||'root';
        options = extend({q: "'"+identifier+"' in parents", auth: self._oauth2Client}, options || {});

        var deferred = q.defer();
        client.files
            .list(options, function (err, result) {
                if (err) return deferred.reject(err);
                return deferred.resolve(result);
            });
        return deferred.promise;
    })
};

///////////////////////////////////////////////////////////////////////////////
// Event Methods
///////////////////////////////////////////////////////////////////////////////

//TODO: the options should support path_prefix when https://github.com/dropbox/dropbox-js/issues/164
Client.prototype.events = function (cursor,options) {
    var self = this;


    return self._getClient().then(function (client) {

        var defaults = {
            includeSubscribed: false,
            maxResults: 500,
            auth: self._oauth2Client
        }
        if(cursor){
            defaults.startChangeId = cursor
        }
        options = extend(defaults, options || {});

        var deferred = q.defer();
        client.changes
            .list(options, function (err, result) {
                if (err) return deferred.reject(err);
                return deferred.resolve(result);
            });
        return deferred.promise;
    })
};


///////////////////////////////////////////////////////////////////////////////
// Private Methods
///////////////////////////////////////////////////////////////////////////////

Client.prototype._getClient = function() {
    var self = this;
    if (self._googleClientPromise) return self._googleClientPromise;
    var deferred = q.defer();

    self._googleClientPromise = deferred.resolve(googleapis.drive('v2'))
    return deferred.promise;
};

module.exports = Client;