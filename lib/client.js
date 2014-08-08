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

    this._oauth2Client = new googleapis.OAuth2Client(this.config.client_key, this.config.client_secret, this.config.redirect_url);
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
    options = extend({includeSubscribed: true}, options || {});
    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.drive.about
            .get(options)
            .withAuthClient(self._oauth2Client).execute(function (err, result) {
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
    options = extend({includeSubscribed: true}, options || {});
    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.drive.about
            .get(options)
            .withAuthClient(self._oauth2Client).execute(function (err, result) {
                if (err) return deferred.reject(err);
                return deferred.resolve(result);
            });
        return deferred.promise;
    })
};

/**
 * Description
 * @method createFile
 * @param {} fileName
 * @param {} parentIdentifier
 * @param {} content_buffer
 * @param {} options
 * @return CallExpression
 */
Client.prototype.createFile = function (fileName, parentIdentifier, content_buffer, options) {
    var self = this;
    options = extend({title: fileName, mimeType : 'text/plain'}, options || {});

    if (parentIdentifier) {
        options.parents = options.parents || [];
        options.parents.push(parentIdentifier)
    }
    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.drive.files
            .insert(options)
            .withMedia('application/binary', content_buffer)
            .withAuthClient(self._oauth2Client).execute(function (err, result) {
                if (err) return deferred.reject(err);
                return deferred.resolve(result);
            });
        return deferred.promise;
    })
};

/**
 * Description
 * @method deleteFile
 * @param {} identifier
 * @return CallExpression
 */
Client.prototype.deleteFile = function (identifier) {
    var self = this;
    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.drive.files
            .delete({ fileId: identifier })
            .withAuthClient(self._oauth2Client).execute(function (err, result) {
                if (err) return deferred.reject(err);
                return deferred.resolve(result);
            });
        return deferred.promise;
    })
};

/**
 * Description
 * @method downloadFile
 * @param {} identifier
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
 * @param {} identifier
 * @return CallExpression
 */
Client.prototype.getFileInformation = function (identifier) {
    var self = this;
    identifier = identifier ||'root';
    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.drive.files
            .get({ fileId: identifier })
            .withAuthClient(self._oauth2Client).execute(function (err, result) {
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
    options = extend({title: folderName, mimeType : "application/vnd.google-apps.folder"}, options || {});

    if (parentIdentifier) {
        options.parents = options.parents || [];
        options.parents.push(parentIdentifier)
    }
    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.drive.files
            .insert(options)
            .withAuthClient(self._oauth2Client).execute(function (err, result) {
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
    options = extend({}, options || {});
    identifier = identifier ||'root';

    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.drive.files
            .list({ q: "'"+identifier+"' in parents" })
            .withAuthClient(self._oauth2Client).execute(function (err, result) {
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
    var defaults = {
        includeSubscribed: false,
        maxResults: 500
    }
    if(cursor){
        defaults.startChangeId = cursor
    }
    options = extend(defaults, options || {});

    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.drive.changes
            .list(options)
            .withAuthClient(self._oauth2Client).execute(function (err, result) {
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
    googleapis.discover('drive', 'v2').execute(function (err, client) {
        if (err) return deferred.reject(err);
        self._googleClientPromise = deferred.resolve(client);
        return self._googleClientPromise;
    });
    return deferred.promise;
};

module.exports = Client;