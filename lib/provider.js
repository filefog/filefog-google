var googleapis = require('googleapis')
    , q = require('q');

/**
 * Description
 * @method Provider
 * @return 
 */
var Provider = function(){
    //https://developers.google.com/drive/quickstart-nodejs
    //https://developers.google.com/apis-explorer/#p/drive/v2/
    //https://github.com/google/google-api-nodejs-client/
    this._oauth2Client = new googleapis.OAuth2Client(this.config.client_key,
        this.config.client_secret, this.config.redirect_url);
};


/**
 * Description
 * @method oAuthGetAuthorizeUrl
 * @return CallExpression
 */
Provider.prototype.oAuthGetAuthorizeUrl = function() {
    return this._oauth2Client.generateAuthUrl({ access_type: 'offline', scope: this.config.client_scope });
};


/**
 * Description
 * @method oAuthGetAccessToken
 * @param {} code
 * @return MemberExpression
 */
Provider.prototype.oAuthGetAccessToken = function(code) {
    var deferred = q.defer();
    this._oauth2Client.getToken(code, function (err, oauth_data) {
        if (err) return deferred.reject(err);
        return deferred.resolve(oauth_data);
    });
    return deferred.promise;
};

/**
 * Description
 * @method oAuthRefreshAccessToken
 * @param {} credentials
 * @return MemberExpression
 */
Provider.prototype.oAuthRefreshAccessToken = function(credentials){
    this._oauth2Client.credentials = {
        refresh_token : credentials.refresh_token
    };
    var deferred = q.defer();
    this._oauth2Client.refreshAccessToken(function (err, new_oauth_data) {
        if (err) return deferred.reject(err);
        return deferred.resolve(new_oauth_data);
    });
    return deferred.promise;

};

module.exports = Provider;






