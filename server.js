var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    Status = require('./models/status'),
    HttpStatus = require('http-status-codes'),
    morgan = require('morgan');

mongoose.connect(process.env.MONGOLAB_URI, function(error) {
    if (error) console.error(error);
    else console.log('mongo connected');
});

express()
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(morgan('combined'))
    .get('/api/v1', function(req, res) {
        res.status(HttpStatus.OK).json({ msg: 'OK', service: "status webhook" })
    })
    .get('/api/v1/status', function(req, res) {
        Status.paginate({}, { sort: { createdAt: -1 } }, function(err, result) {
            if (err) return res.json(HttpStatus.INTERNAL_SERVER_ERROR, err);
            if (result.docs.length == 0)
                return res.status(HttpStatus.NOT_FOUND).json({ detail: 'no records found' });
            res.json(HttpStatus.OK, result);
        });
    })
    .post('/api/v1/status', function(req, res) {
        var status = new Status(req.body);
        status.save(function(err, createdStatus) {
            if (err) return res.json(HttpStatus.INTERNAL_SERVER_ERROR, err);
            res.json(HttpStatus.OK, createdStatus);
        });
    })

.listen(process.env.PORT || 5000);
