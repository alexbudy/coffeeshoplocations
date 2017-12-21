var express = require('express');
var bodyParser = require('body-parser');

const app = express();

const port = 8000;

app.use(bodyParser.urlencoded({ extended: true }));

require('./app/routes')(app, {});
app.listen(port, () => { 
    console.log('We are live on ' + port);
});

