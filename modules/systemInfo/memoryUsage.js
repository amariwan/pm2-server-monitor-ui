'use strict';
const si = require('systeminformation');

 si.mem()
  .then(data => var memoryString= (((data.used/data.total)*100).toString()))
  .catch(error => res.status(404).send(siError))

module.exports = memoryString;
