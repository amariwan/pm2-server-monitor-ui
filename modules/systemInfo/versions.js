const si = require('systeminformation');
si.versions().then((data) => console.log(data));
