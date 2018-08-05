var express = require('express');

module.exports = app => {
    // register route controllers
    var demo = require('../routes/demo');
    var getStart = require('../routes/get-start');
    var router = express.Router();
    app.use('/', router);

    //home
    app.get('/', (req, res) => {
        res.render('home', { title: 'Sales forecast' });
    });

    //demo
    router.get('/demo', demo.viewPage);

    //get-start
    router.get('/get-start', getStart.viewPage);
    router.post('/get-start/upload', getStart.upload);
    router.post('/get-start/clear', getStart.clear);
    router.post('/get-start/calc', getStart.calculate);
};
