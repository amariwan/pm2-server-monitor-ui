const si = require('systeminformation');
si.services('mysql, postgres').then((data) => console.log(data));
