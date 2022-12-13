const si = require('systeminformation');
si.mem().then((data) => console.log(data));
