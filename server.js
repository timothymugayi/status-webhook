var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    Status = require('./models/status'),
    HttpStatus = require('http-status-codes'),
    morgan = require('morgan'),
    basicAuth = require('basic-auth');

mongoose.connect(process.env.MONGOLAB_URI, function(error) {
    if (error) console.error(error);
    else console.log('mongo connected');
});

function paginationFilter(req) {
    var perPage = parseInt(req.query.limit > 0 ? Math.min(req.query.limit, 100) : 10),
        page = parseInt(req.query.page > 0 ? req.query.page : 1);
    return {
        page: page,
        sort: { createdAt: -1 },
        limit: perPage
    };
}


var isAuthenticated = function(req, res, next) {
    function unauthorized(res) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.send(HttpStatus.UNAUTHORIZED);
    };

    var user = basicAuth(req);

    if (!user || !user.name || !user.pass) {
        return unauthorized(res);
    };

    if (user.name === process.env.USERNAME && user.pass === process.env.PASSWORD) {
        return next();
    } else {
        return unauthorized(res);
    };
};

express()
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(morgan('combined'))
    .use(express.static(__dirname + '/public'))
    .set('view engine', 'ejs')
    .get('/', function(req, res) {
        res.render('index');
    })
    .get('/api/v1', function(req, res) {
        res.status(HttpStatus.OK).json({ msg: 'OK', service: "status webhook" })
    })
    .get('/api/v1/status', isAuthenticated, function(req, res) {
        Status.paginate({}, paginationFilter(req), function(err, result) {
            if (err) return res.json(HttpStatus.INTERNAL_SERVER_ERROR, err);
            if (result.docs.length == 0)
                return res.status(HttpStatus.NOT_FOUND).json({ detail: 'no records found' });
            res.json(HttpStatus.OK, result);
        });
    })
    .post('/api/v1/status', isAuthenticated, function(req, res) {
        var status = new Status(req.body);
        status.save(function(err, createdStatus) {
            if (err) return res.json(HttpStatus.INTERNAL_SERVER_ERROR, err);
            res.json(HttpStatus.OK, createdStatus);
        });
    })

.listen(process.env.PORT || 5000);
