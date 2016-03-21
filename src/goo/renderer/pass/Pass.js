/**
 * Base pass class
 */
function Pass() {}

Pass.prototype.destroy = function (/* renderer */) {};

Pass.prototype.render = function (/* renderer, writeBuffer, readBuffer, delta, maskActive, camera, lights, clearColor */) {};

Pass.prototype.updateSize = function (/* size, renderer */) {};

Pass.prototype.invalidateHandles = function (/* renderer */) {};

module.exports = Pass;