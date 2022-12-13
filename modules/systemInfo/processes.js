'use strict';

const si = require('systeminformation');
si.processes().then((data) => console.log(data));
si.currentLoad().then((data) => console.log(data)).catch((error) => console.error(error));

// module.exports =
