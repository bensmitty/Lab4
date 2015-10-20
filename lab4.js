var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
router.use(bodyParser());
var mysql = require('mysql');

var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'toor',
    database: 'CSC443'
});




// Setup the item routes
router.route('/:id')
    .get(function (req, res, next)
    {
        var id = req.params['id'];
        console.log(id);
        if (id && Number(id)) {
            getItem(id, function(err,data) {
                console.log(data);
                if(data)
                {
                    res.send({
                        Status: 'Item found',
                        'Item id': Number(data.id),
                        'Item Name': data.name,
                        'Item Price': data.price,
                    });
                }
                else
                {
                    res.send(404, { Status: 'Item not found' });
                }
            });
        }
        else {
            res.send(404, { status: 'Invalid entry' });
        }
    })
    .post(function (req, res, next)
    {
        //console.log(parseInt(req.body['id']));
        if(Number(parseInt(req.body['id'])) && req.body['name'] && Number(req.body['price']))
        {
            console.log("Passed");
            postItem(req.body['id'], req.body['name'], req.body['price'])
        }
        else
        {
            res.send("Invalid data");
        }
        //res.send("Implementing post " + req.body['description']);
    })
    .all(function (req, res, next) {
        res.send(501, { Status: 'Not implemented' });
    });


function getItem(product_id, callback) {
    var get  = {id: product_id};
    pool.getConnection(function(err,connection)
    {
        if(err)
        {
            connection.release();
            callback(err,null);
            return;
        }

        console.log("DB connection thread: " + connection.threadId);

        connection.query('SELECT * FROM PRODUCT WHERE ?', get, function(err, results){
            connection.release();
            if (!err)
            {
                if(results[0] != null)
                {
                    callback(null, results[0]);
                }
                else
                {
                    callback("Product not found.", null);
                }
            }
            else
            {
                callback(err,null);
            }

        });

        connection.on('error', function(err)
        {
            console.log(err.code);
            callback("Error", null);
            return;
        });
    });

}


function postItem(product_id, product_name, product_price, callback)
{
    pool.getConnection(function(err,connection)
    {
        if(err)
        {
            connection.release();
            callback(err,null);
            return;
        }

        console.log("DB connection thread: " + connection.threadId);

        connection.query('INSERT INTO PRODUCT VALUES(' + product_id + ',"' + product_name + '",' + product_price + ')', function(err, results){
            connection.release();
            //console.log("here");
            if (!err)
            {
                //console.log("here");
                if(results[0] != null)
                {
                    //console.log("here");
                    callback(null, results[0]);
                }
                else
                {
                    console.log("here");
                    //return;
                    callback("Good");
                }
            }
            else
            {
                callback(err,null);
            }

        });

        connection.on('error', function(err)
        {
            console.log(err.code);
            callback("Error", null);
            return;
        });
    });

}


// Use the router
var app = express()
    .use('/price', router)
    .listen(8080);