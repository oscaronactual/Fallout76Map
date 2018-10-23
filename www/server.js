const express = require('express');
const app = express();
const port = 3000;

app.use('/',express.static('www'));

//app.get('/', (req, res) => res.send('edit_adminz_1337_5TUFF.html'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));