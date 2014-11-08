var transform = {};

/**
 * Description
 * @method accountInfo
 * @param {} account_response
 * @return transform
 */
transform.accountInfo = function(account_response){

    var transform = {};
    transform.name = account_response.user.displayName;
    transform.email = '';
    transform.avatar_url = '';
    transform.created_date = null;
    transform.modified_date = null;
    transform.id = account_response.permissionId;
    transform._raw = account_response;
    return transform;
};

/**
 * Description
 * @method checkQuota
 * @param {} quota_response
 * @return transform
 */
transform.checkQuota = function (quota_response){
    var transform = {};
    transform.total_bytes = quota_response.quotaBytesTotal | 0; //total space allocated in bytes
    transform.used_bytes = quota_response.quotaBytesUsed | 0; //bytes used.
    transform.limits= {
        upload_size : '10737418240'
    };
    transform._raw = quota_response;
    return transform;
};

/**
 * Description
 * @method deleteFile
 * @param {} deletion_response
 * @return transform
 */
transform.deleteFile = function(deletion_response){
    var transform = {};
    transform.success = true;
    transform._raw = deletion_response;
    return transform;
};

/**
 * Description
 * @method downloadFile
 * @param {} download_response
 * @return transform
 */
transform.downloadFile = function(download_response){
    var transform = {};
    transform.data = download_response.data;
    transform.headers = download_response.headers;
    transform._raw = download_response;
    return transform;
};

/**
 * Description
 * @method getFileInformation
 * @param {} file_response
 * @return transform
 */
transform.getFileInformation = function (file_response){
    var transform = {};
    transform.is_file = (file_response.mimeType != "application/vnd.google-apps.folder");
    transform.is_folder = (file_response.mimeType == "application/vnd.google-apps.folder");
    transform.etag = file_response.etag;
    transform.identifier = file_response.id;
    transform.parent_identifier = (file_response.parents && file_response.parents.length > 0 ? file_response.parents[0].id : '');
    transform.mimetype = file_response.mimeType;
    transform.created_date = new Date(file_response.createdDate);
    transform.modified_date = new Date(file_response.modifiedDate);
    transform.name = file_response.title;
    transform.description = '';
    //transform.extension = file_response.name.split('.')
    transform.checksum = file_response.md5Checksum;
    transform.file_size = file_response.fileSize;
    transform._raw = file_response;
    return transform;
};

/**
 * Description
 * @method deleteFolder
 * @param {} deletion_response
 * @return transform
 */
transform.deleteFolder = function(deletion_response){
    var transform = {};
    transform.success = true;
    transform._raw = deletion_response;
    return transform;
};


/**
 * Description
 * @method getFolderInformation
 * @param {} folder_response
 * @return transform
 */
transform.getFolderInformation = function(folder_response){
    var transform = {};
    transform.is_file = (folder_response.mimeType != "application/vnd.google-apps.folder");
    transform.is_folder = (folder_response.mimeType == "application/vnd.google-apps.folder");
    transform.etag = folder_response.etag;
    transform.identifier = folder_response.id;
    transform.parent_identifier = (folder_response.parents.length >0 ? folder_response.parents[0].id : '');
    transform.created_date = new Date(folder_response.createdDate);
    transform.modified_date = new Date(folder_response.modifiedDate);
    transform.name = folder_response.title;
    transform.description = '';
    transform._raw = folder_response;
    return transform;
};


/**
 * Description
 * @method retrieveFolderItems
 * @param {} items_response
 * @return transform
 */
transform.retrieveFolderItems = function(items_response){
    var self = this;
    var transform = {};
    transform.total_items = null;
    transform.content = items_response.items.map(function(current_item){
        if(current_item.mimeType != "application/vnd.google-apps.folder"){
            return self.getFileInformation(current_item);
        }
        else{
            return self.getFolderInformation(current_item);
        }
    });
    return transform;
};


///////////////////////////////////////////////////////////////////////////////
// Event transforms


transform.eventUpsert = function(event){
    var self = this;
    var item ={};

    if(event.file.mimeType != "application/vnd.google-apps.folder"){
        item = self.getFileInformation(event.file);
    }
    else{
        item = self.getFolderInformation(event.file);
    }
    item.event_type = "upsert";
    return item;
}

transform.eventDelete = function(event){
    return {
        event_type: "delete",
        identifier: event.fileId
    }
}

transform.events = function(events_response){
    var self = this;
    var transform = {};
    transform.next_cursor = events_response.largestChangeId;
    transform.events = events_response.items.map(function(event){
        if(event.deleted){
            return self.eventDelete(event);
        }
        else{
            return self.eventUpsert(event)
        }
    })
    transform._raw = events_response;
    return transform;
}


///////////////////////////////////////////////////////////////////////////////
// Aliases
transform.createFile = transform.getFileInformation;
transform.createFolder = transform.getFolderInformation;

///////////////////////////////////////////////////////////////////////////////
// OAuth transforms

/**
 * Description
 * @method oAuthGetAccessToken
 * @param {} token_response
 * @return transform
 */
transform.oAuthGetAccessToken = function(token_response){
    var transform = {};
    transform.access_token = token_response.access_token;
    transform.refresh_token = token_response.refresh_token;
    //calculate expiry
    var expiration_utc_timestamp = token_response.expiry_date;
    transform.expires_on = (new Date(expiration_utc_timestamp)).toISOString();
    transform._raw = token_response;
    return transform;
}

/**
 * Description
 * @method oAuthRefreshAccessToken
 * @param {} token_response
 * @return transform
 */
transform.oAuthRefreshAccessToken = function(token_response){
    var transform = {};
    transform.access_token = token_response.access_token;
    transform.refresh_token = token_response.refresh_token;
    //calculate expiry
    var expiration_utc_timestamp = token_response.expiry_date;
    transform.expires_on = (new Date(expiration_utc_timestamp)).toISOString();
    transform._raw = token_response;
    return transform;
}

module.exports = transform;
