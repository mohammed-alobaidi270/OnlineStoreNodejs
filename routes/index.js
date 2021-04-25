var express = require('express');
var router = express.Router();
var dbConn  = require('../config/database');
/* GET home page. */



 
// display books page
router.get('/', function(req, res, next) {

    dbConn.query('SELECT * FROM products ORDER BY product_id desc',function(err,rows)     {

        if(err) {
            req.flash('error', err);
            // render to views/books/index.ejs
            res.render('index',{data:''});   
        } else {
            // render to views/books/index.ejs
            res.render('index',{data:rows});
        }
    });
});
router.get('/discounts', function(req, res, next) {

  dbConn.query('SELECT * FROM products ORDER BY product_id desc',function(err,rows)     {

      if(err) {
          req.flash('error', err);
          // render to views/books/index.ejs
          res.render('index',{data:''});   
      } else {
          // render to views/books/index.ejs
          res.render('index',{data:rows});
      }
  });
});


module.exports = router;
