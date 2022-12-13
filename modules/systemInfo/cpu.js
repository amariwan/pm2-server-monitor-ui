const si = require('systeminformation');
si.cpu().then((data) => console.log(data));
si.cpuFlags().then((data) => console.log(data));
