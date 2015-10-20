/**
 * Created by Administrator on 9/30/2015.
 */
/**
 * Created by Vico on 9/16/2015.
 * Updated by Ben 9/30/15
 * Updated by Ben 10/6/15 to use connection pooling
 */
var http = require('http');
var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 3,
    host: 'localhost',
    user: 'root',
    password: 'toor',
    database: 'CSC443'
});


function getPrice(product_id, callback) {

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

        connection.query('SELECT PRICE FROM PRODUCT WHERE ?', get, function(err, results){
            connection.release();
            if (!err)
            {
                if(results[0] != null)
                {
                    callback(null, results[0].PRICE);
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

function handleRequest(req, res) {
console.log(req.headers);
    getPrice(req.url.replace("/", ""), function(err,data){
        var result;
        var httpcode = 200;

        if (err) {
            httpcode = 503;
            result = {
                error_code: 503,
                message: "Product ID: " + req.url.replace("/", "") + " does not exist"
            };
        } else {
            result = {
                product_id: req.url.replace("/", ""),
                price: data
            };
        }
        res.writeHead(httpcode, {"Content-Type": "application/json"});
        res.end(JSON.stringify(result) + "\n");
    });
}

var server = http.createServer(handleRequest);
server.listen(8080);

