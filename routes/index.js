var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Torno Comm' });
});

router.get('/received', function(req, res, next) {
  res.render('received', { title: 'Archivos recibidos' });
});

module.exports = router;
