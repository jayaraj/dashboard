/* */ 
var $export = require('./$.export'),
    getProto = require('./$').getProto,
    anObject = require('./$.an-object');
$export($export.S, 'Reflect', {getPrototypeOf: function getPrototypeOf(target) {
    return getProto(anObject(target));
  }});
