const si = require('systeminformation');
si.versions('npm, php, postgresql').then((data) => console.log(data));
