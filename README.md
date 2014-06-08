# FileFog Provider

[![wercker status](https://app.wercker.com/status/ef333f2ec4b0e2f37d93169cf1331423/s "wercker status")](https://app.wercker.com/project/bykey/ef333f2ec4b0e2f37d93169cf1331423)[![Dependency Status](https://gemnasium.com/filefog/filefog-google.png)](https://gemnasium.com/filefog/filefog-google)

A [Filefog](https://github.com/filefog/filefog) adapter for Google Drive. May be used in a [Sails](https://github.com/balderdashy/sails) app or anything using Waterline for the ORM.

## Install

Install is through NPM.

```bash
$ npm install filefog-google --save
```

## Configuration

The following config options are required:

```javascript
config: {
    client_key : '',
    client_secret : '',
    client_scope : "https://www.googleapis.com/auth/drive",
    redirect_url : 'http://localhost:3000/service/callback/google'
};
```

## Testing

Test are written with mocha. Integration tests are handled by the [filefog-provider-tests](https://github.com/filefog/filefog-provider-tests) project, which tests provider methods against the latest FileFog API.

To run tests:

```bash
$ npm test
```

## About FileFog

FileFog is a cloud agnostic file API.  It provides a uniform API for accessing stuff from different kinds of cloud providers and file systems.  That means you write the same code to manipulate files, whether they live in google drive, dropbox, box.net, or your local file system.

To learn more visit the project on GitHub at [FileFog](https://github.com/filefog/filefog).