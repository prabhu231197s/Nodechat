var client = require('socket.io').listen(2222).sockets;
var mysql = require('mysql');

var con = mysql.createConnection({
    host : "127.0.0.1",
    port : 3306,
    user : "root",
    password : "admin@123",
    database : "chat"
});


con.connect(function (err) {
    if(err){
        console.log('Failed Db connection:'+err.message);
    }
    else{
        client.on('connection',function (socket) {
            var query = "SELECT * from messages order by id limit 50 ";
            con.query(query,function (err, data) {
                if(err){
                    console.log('Error retrieving:'+err.message);
                }
                else{
                    socket.emit('exist',data);
                }
            });
            socket.on('input',function (data) {
                var name = data.name;
                var message = data.message;
                var sendstatus = function (s) {
                    socket.emit('status',s);
                };
                var whitespace = /^\s*$/;

                if(whitespace.test(name) || whitespace.test(message)){
                    sendstatus('Name and message is required');
                }
                else{
                    var query = "INSERT into messages set ?";
                    con.query(query,data,function (err) {
                        if(err){
                            console.log('Error inserting in db:'+err.message);
                        }
                        else{
                            var status = {};
                            status.message = "Message sent";
                            status.clear = true;
                            client.emit('add',data);
                            socket.emit('status',status);
                        }
                    });
                }

            });
        });
    }
});
