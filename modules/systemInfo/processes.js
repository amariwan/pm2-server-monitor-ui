'use strict';

const si = require('systeminformation');
// promises style - new since version 3
si.currentLoad().then((data) => console.log(data)).catch((error) => console.error(error));

// module.exports =
