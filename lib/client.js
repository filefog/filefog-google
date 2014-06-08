var q = require('q')
    , request = require('request')
    , googleapis = require('googleapis')
    , extend = require('node.extend');

var Client = function () {

    //TODO: this is not required;
    if (!this.credentials)
        //throw new FFParameterRejected("oauth_data cannot be null")

    this.oauth2Client = new googleapis.OAuth2Client(this.config.client_key, this.config.client_secret, this.config.redirect_url);
    this.oauth2Client.credentials = this.credentials;

    this.googleClientPromise = null;
};

Client.prototype._getClient = function() {
    var self = this;
    if (self.googleClientPromise) return self.googleClientPromise;
    var deferred = q.defer();
    googleapis.discover('drive', 'v2').execute(function (err, client) {
        if (err) return deferred.reject(err);
        self.googleClientPromise = deferred.resolve(client);
        return self.googleClientPromise;
    });
    return deferred.promise;
};

Client.prototype.accountInfo = function (options) {
    var self = this;
    options = extend({includeSubscribed: true}, options || {});
    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.drive.about
            .get(options)
            .withAuthClient(self.oauth2Client).execute(function (err, result) {
                if (err) return deferred.reject(err);
                return deferred.resolve(result);
            });
        return deferred.promise;
    })
};

Client.prototype.checkQuota = function (options) {
    var self = this;
    options = extend({includeSubscribed: true}, options || {});
    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.drive.about
            .get(options)
            .withAuthClient(self.oauth2Client).execute(function (err, result) {
                if (err) return deferred.reject(err);
                return deferred.resolve(result);
            });
        return deferred.promise;
    })
};

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
            .withAuthClient(self.oauth2Client).execute(function (err, result) {
                if (err) return deferred.reject(err);
                return deferred.resolve(result);
            });
        return deferred.promise;
    })
};

Client.prototype.deleteFile = function (identifier) {
    var self = this;
    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.drive.files
            .trash({ fileId: identifier })
            .withAuthClient(self.oauth2Client).execute(function (err, result) {
                if (err) return deferred.reject(err);
                return deferred.resolve(result);
            });
        return deferred.promise;
    })
};

Client.prototype.downloadFile = function (identifier) {
    var self = this;
    return self.getFileInformation(identifier).then(function(meta_data){
        var deferred = q.defer();
        request.get(
            {
                headers: {
                    'Authorization': 'Bearer ' + this.credentials.access_token
                },
                url: meta_data.downloadUrl,
                encoding: null /*forces the content to be sent back in binary form, body will always be a buffer.*/
            },
            function (err, r, body) {
                if (err) return deferred.reject(err);
                return deferred.resolve({ "response": r, "body": body});
            }
        );
        return deferred;
    })
};

Client.prototype.getFileInformation = function (identifier) {
    var self = this;
    identifier = identifier ||'root';
    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.drive.files
            .get({ fileId: identifier })
            .withAuthClient(self.oauth2Client).execute(function (err, result) {
                if (err) return deferred.reject(err);
                return deferred.resolve(result);
            });
        return deferred.promise;
    })
};

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
            .withAuthClient(self.oauth2Client).execute(function (err, result) {
                if (err) return deferred.reject(err);
                return deferred.resolve(result);
            });
        return deferred.promise;
    })
};

Client.prototype.deleteFolder = Client.prototype.deleteFile;

Client.prototype.getFolderInformation = Client.prototype.getFileInformation;

Client.prototype.retrieveFolderItems = function (identifier,options) {
    var self = this;
    options = extend({}, options || {});
    identifier = identifier ||'root';

    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.drive.children
            .list({ folderId: identifier })
            .withAuthClient(self.oauth2Client).execute(function (err, result) {
                if (err) return deferred.reject(err);
                return deferred.resolve(result);
            });
        return deferred.promise;
    })
};

module.exports = Client;