require('mysql');
require('express');

//var pool = mysql.createPool();

var router = express.Router();
router.use(bodyParser());

router.route('/:id')
    .get(function (req, res, next){
        getPrice(req.params['id'], function (err, data){
            if (data){
                res.send({
                    status: 'Item found',
                    item: req.params['id'],
                    price: data
                });
            }
            else{
                res.send(404, {status: 'Not found'});
            }
        });
    });


var app = express()
    .use('/price', router)
    .listen(8080);
