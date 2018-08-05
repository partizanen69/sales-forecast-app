const path = require('path'),
    rootPath = path.normalize(__dirname + '/../'); // normalizes to base path

module.exports = {
    development: {
        rootPath: rootPath,
        database: 'mongodb://localhost:27017/sales-forecast',
        port: process.env.PORT || 3000,
    },
    production: {
        rootPath: rootPath,
        database:
            'mongodb://oleksii:Q55555@ds161751.mlab.com:61751/sales-forecast',
        port: process.env.PORT || 80,
    },
};
