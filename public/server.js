const express = require('express');
const app = express();
app.use(express.static(__dirname));


app.get('/assignment3.js', (req, res) => {
    res.sendFile('assignment3.js');
});

app.get('/index.html', (req, res) => {
    res.sendFile('index.html');
});


app.listen(3000, '127.0.0.1');
