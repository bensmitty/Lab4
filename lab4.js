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
	.delete (function (req, res, next)
	{
		var id = req.params['id'];
		console.log("Remove item: " + id);
		if (id && Number(id))
		{
			deleteItem(id, function(err, data)
			{
				console.log(data  + " item(s) removed from database");
				if (data)
				{
					res.send(
                    {
                        Status: data + ' item(s) removed',
                        'Item id': Number(id),                        
                    });
				}
				else
                {
                    res.send(404, { Status: 'Item not found' });
                }
			});
		}
		else
		{
            res.send(404, { status: 'Invalid entry' });
        }
	})
	
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
		var id = req.params['id'];
        //console.log(parseInt(req.body['id']));
        if(Number(parseInt(id)) && req.body['name'] && Number(req.body['price']))
        {
            //console.log("Passed");
            postItem(id, req.body['name'], req.body['price'], function(err,data)
            {
                console.log(data + " item(s) entered into database");
                res.send(
                    {
                        Status: data + ' Item entered',
                        'Item id': Number(id),
                        'Item Name': req.body['name'],
                        'Item Price': req.body['price'],
                    }
                );
            });
        }
        else
        {
            res.send("Invalid data");
        }
        //res.send("Implementing post " + req.body['description']);
    })
    .put(function (req, res, next)
    {
		var id = req.params['id'];
        if(Number(parseInt(id)) && req.body['name'] && Number(req.body['price']))
        {
            putItem(id, req.body['name'], req.body['price'], function(err,data)
            {
                console.log(data);
                res.send(
                    {
                        Status: data + ' item(s) replaced',
                        'Item id': Number(id),
                        'Item Name': req.body['name'],
                        'Item Price': req.body['price'],
                    }
                );
            });
        }
    })
    .all(function (req, res, next) {
        res.send(501, { Status: 'Not implemented' });
    });
	
	
function deleteItem(product_id, callback)
{
	var get = {id: product_id};
	pool.getConnection(function(err,connection)
    {
        if(err)
        {
            connection.release();
            callback(err,null);
            return;
        }

        console.log("DB connection thread: " + connection.threadId);

        connection.query('DELETE FROM PRODUCT WHERE ?', get, function(err, results){
            connection.release();
            if (!err)
            {
				callback(null, results.affectedRows)                
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
    var post  = {id: product_id, name: product_name , price:product_price};
    pool.getConnection(function(err,connection)
    {
        if(err)
        {
            connection.release();
            callback(err,null);
            return;
        }

        console.log("DB connection thread: " + connection.threadId);

        connection.query('INSERT INTO PRODUCT SET ?', post, function(err, results){
            connection.release();
            //console.log("here");
            //console.log("Error" + err);
            if (!err)
            {
                //console.log(results);
                callback(null, results.affectedRows);

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


function putItem(product_id, product_name, product_price, callback)
{
    var id = {id: product_id};
    var post  = {name: product_name , price:product_price};
    pool.getConnection(function(err,connection)
    {
        if(err)
        {
            connection.release();
            callback(err,null);
            return;
        }

        console.log("DB connection thread: " + connection.threadId);

        connection.query('UPDATE PRODUCT SET name=?,price=? WHERE id=?', [product_name,product_price,product_id], function(err, results){
            connection.release();
            if (!err)
            {
                callback(null, results.changedRows);

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