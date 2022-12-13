const si = require('systeminformation');
si.mem().then((data) => console.log(data));
si.memLayout().then((data) => console.log(data));
