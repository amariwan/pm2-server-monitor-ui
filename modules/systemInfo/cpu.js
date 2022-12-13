const si = require('systeminformation');
// si.cpu().then((data) => console.log(data));
// si.cpuFlags().then((data) => console.log(data));
// si.cpuCache().then((data) => console.log(data));
// si.cpuCurrentSpeed().then((data) => console.log(data));
si.cpuTemperature().then((data) => console.log(data));
const osxTemp = require('osx-temperature-sensor');

let temperature = osxTemp.cpuTemperature();
console.log('CPU-Information:');
console.log(temperature);
