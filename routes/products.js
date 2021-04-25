var express = require('express');
var router = express.Router();
var dbConn = require('../config/database');
const multer = require('multer');
var path = require('path');
const imageFilter = function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/products');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
// display books page
router.get('/', function (req, res, next) {

    dbConn.query('SELECT * FROM products ORDER BY product_id desc', function (err, rows) {

        if (err) {
            req.flash('error', err);
            // render to views/books/index.ejs
            res.render('products', { data: '' });
        } else {
            // render to views/books/index.ejs
            res.render('products', { data: rows });
        }
    });
});

// display add book page
router.get('/add', function (req, res, next) {
    // render to add.ejs
    res.render('products/add', {
        name: '',
        quantity: '',
        description: '',
        price: '',
        filename: ''
    })
})
let upload = multer({ storage: storage, fileFilter: imageFilter }).single('filename');

// add a new book
router.post('/add', upload, function (req, res, next) {
    console.log(req);
    let name = req.body.name;
    let quantity = req.body.quantity;
    let description = req.body.description;
    let price = req.body.price;
    let filename = req.file.path.substr(7);

    let errors = false;
    if (name.length === 0 || quantity.length === 0 || description.length === 0 || price.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter all the informations");
        // render to add.ejs with flash message
        res.render('products/add', {
            name: name,
            quantity: quantity,
            description: description,
            price: price,
            filename: filename
        })
    }
    // upload(req, res, function (err) {
    //     // req.file contains information of uploaded file
    //     // req.body contains information of text fields, if there were any

    //     if (req.fileValidationError) {
    //         return res.send(req.fileValidationError);
    //     }
    //     else if (!req.file) {
    //         return res.send('Please select an image to upload');
    //     }
    //     else if (err instanceof multer.MulterError) {
    //         return res.send(err);
    //     }
    //     else if (err) {
    //         return res.send(err);
    //     }
    //     filename = req.file.path;
    // });
    // if no error
    if (!errors) {

        var form_data = {
            name: name,
            quantity: quantity,
            description: description,
            price: price,
            filename: filename
        }

        // insert query
        dbConn.query('INSERT INTO products SET ?', form_data, function (err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)

                // render to add.ejs
                res.render('products/add', {
                    name: form_data.name,
                    quantity: form_data.quantity,
                    description: form_data.description,
                    price: form_data.price,
                    filename: form_data.filename
                })
            } else {
                req.flash('success', 'products successfully added');
                res.redirect('/products');
            }
        })
    }
})

// display edit book page
router.get('/edit/(:product_id)', function (req, res, next) {

    let product_id = req.params.product_id;

    dbConn.query('SELECT * FROM products WHERE product_id = ' + product_id, function (err, rows, fields) {
        if (err) throw err

        // if user not found
        if (rows.length <= 0) {
            req.flash('error', 'products not found with id = ' + product_id)
            res.redirect('/products')
        }
        // if book found
        else {
            // render to edit.ejs
            res.render('products/edit', {
                title: 'Edit product',
                product_id: rows[0].product_id,
                name: rows[0].name,
                quantity: rows[0].quantity,
                description: rows[0].description,
                price: rows[0].price,
                filename: rows[0].filename


            })
        }
    })
})

// update book data
router.post('/update/:product_id', function (req, res, next) {

    let product_id = req.params.product_id;
    let name = req.body.name;
    let quantity = req.body.quantity;
    let description = req.body.description;
    let price = req.body.price;
    let filename = req.body.filename;
    let errors = false;

    if (name.length === 0 || quantity.length === 0 || description.length === 0 || price.length === 0 || filename.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter all the informations");
        // render to add.ejs with flash message
        res.render('products/edit', {
            product_id: req.params.product_id,
            name: name,
            quantity: quantity,
            description: description,
            price: price,
            filename: filename
        })
    }

    // if no error
    if (!errors) {

        var form_data = {
            name: name,
            quantity: quantity,
            description: description,
            price: price,
            filename: filename
        }
        // update query
        dbConn.query('UPDATE products SET ? WHERE id = ' + id, form_data, function (err, result) {
            //if(err) throw err
            if (err) {
                // set flash message
                req.flash('error', err)
                // render to edit.ejs
                res.render('products/edit', {
                    product_id: req.params.product_id,
                    name: form_data.name,
                    quantity: form_data.quantity,
                    description: form_data.description,
                    price: form_data.price,
                    filename: form_data.filename
                })
            } else {
                req.flash('success', 'products successfully updated');
                res.redirect('/products');
            }
        })
    }
})

// delete book
router.get('/delete/(:product_id)', function (req, res, next) {

    let product_id = req.params.product_id;

    dbConn.query('DELETE FROM products WHERE product_id = ' + product_id, function (err, result) {
        //if(err) throw err
        if (err) {
            // set flash message
            req.flash('error', err)
            // redirect to books page
            res.redirect('/products')
        } else {
            // set flash message
            req.flash('success', 'products successfully deleted! ID = ' + product_id)
            // redirect to books page
            res.redirect('/products')
        }
    })
})

module.exports = router;

/*var express = require('express');
var app = express();
var database = require('../config/database');

database.connect((err) => {
    if (err) throw err;
});


app.get('/product/product_id/:id',(req, res) => {
    let sql ='SELECT * FROM product WHERE product_id = ${req.params.id}';

    database.query(sql, (err, result) => {
        if (err) {
            res.status(400).json({
                message: err
            });
        }
        if (result.length) res.json(result);
        else res.json({});
    });

});

app.post('/product',(req, res) => {
    let sql = 'INSERT INTO product ( name, quantity, description, price, filename) VALUES (
        '${req.body.name}',
        '${req.body.quantity}',
        '${req.body.description}',
        '${req.body.price}',
        '${req.body.filename}'
    )';

    database.query(sql, (err, result) => {
        if (err) {
            res.status(400).json({
                message: err
            });
            return;
        }
        res.status(200).json({
            status: 200,
            success:true
        });
    });
});

app.delete('/product',(req, res) => {
    let sql = 'DELETE FROM product WHERE product_id = ${req.params.product_id} ';

    database.query(sql, (err, result) => {
        if (err) {
            res.status(400).json({
                status:400,
                success: false
            });

        }
        res.status(200).json({
            status: 200,
            success:true
        });
    });
});

module.exports = app;
*/
