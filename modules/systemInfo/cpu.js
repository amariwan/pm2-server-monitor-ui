const si = require('systeminformation');
// si.cpu().then((data) => console.log(data));
// si.cpuFlags().then((data) => console.log(data));
// si.cpuCache().then((data) => console.log(data));
// si.cpuCurrentSpeed().then((data) => console.log(data));
si.cpuTemperature().then((data) => console.log(data));
