/* */ 
var $export = require('./$.export'),
    sign = require('./$.math-sign');
$export($export.S, 'Math', {cbrt: function cbrt(x) {
    return sign(x = +x) * Math.pow(Math.abs(x), 1 / 3);
  }});
