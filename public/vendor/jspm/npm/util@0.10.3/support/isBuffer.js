/* */ 
(function(Buffer) {
  module.exports = function isBuffer(arg) {
    return arg instanceof Buffer;
  };
})(require('buffer').Buffer);
