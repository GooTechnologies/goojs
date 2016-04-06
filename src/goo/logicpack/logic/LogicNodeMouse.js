var LogicLayer = require('./LogicLayer');
var LogicNode = require('./LogicNode');
var LogicNodes = require('./LogicNodes');
var LogicInterface = require('./LogicInterface');

/**
 * Logic node that reads mouse input.
 * @private
 */
function LogicNodeMouse() {
	LogicNode.call(this);
	this.logicInterface = LogicNodeMouse.logicInterface;
	this.type = 'LogicNodeMouse';

	this.eventMouseMove = function (event) {
		var mx = event.clientX;
		var my = event.clientY;
		var dx = mx - this.x;
		var dy = my - this.y;
		LogicLayer.writeValue(this.logicInstance, LogicNodeMouse.portX, mx);
		LogicLayer.writeValue(this.logicInstance, LogicNodeMouse.portY, my);
		LogicLayer.writeValue(this.logicInstance, LogicNodeMouse.portDX, dx);
		LogicLayer.writeValue(this.logicInstance, LogicNodeMouse.portDY, dy);
	}.bind(this);

	this.eventMouseDown = function (event) {
		if (event.button === 0) {
			LogicLayer.fireEvent(this.logicInstance, LogicNodeMouse.outEventLmb);
		}
		if (event.button === 2) {
			LogicLayer.fireEvent(this.logicInstance, LogicNodeMouse.outEventRmb);
		}
	}.bind(this);
}

LogicNodeMouse.prototype = Object.create(LogicNode.prototype);
LogicNodeMouse.editorName = 'Mouse';

LogicNodeMouse.prototype.onSystemStarted = function () {
	this.x = 0;
	this.y = 0;
	document.addEventListener('mousemove', this.eventMouseMove, false);
	document.addEventListener('mousedown', this.eventMouseDown, false);
};

LogicNodeMouse.prototype.onSystemStopped = function () {
	document.removeEventListener('mousemove', this.eventMouseMove);
	document.removeEventListener('mousedown', this.eventMouseDown);
};

LogicNodeMouse.logicInterface = new LogicInterface();
LogicNodeMouse.portX = LogicNodeMouse.logicInterface.addOutputProperty('x', 'float', 0);
LogicNodeMouse.portY = LogicNodeMouse.logicInterface.addOutputProperty('y', 'float', 0);
LogicNodeMouse.portDX = LogicNodeMouse.logicInterface.addOutputProperty('dx', 'float', 0);
LogicNodeMouse.portDY = LogicNodeMouse.logicInterface.addOutputProperty('dy', 'float', 0);
LogicNodeMouse.outEventLmb = LogicNodeMouse.logicInterface.addOutputEvent('lmb');
LogicNodeMouse.outEventRmb = LogicNodeMouse.logicInterface.addOutputEvent('rmb');

LogicNodes.registerType('LogicNodeMouse', LogicNodeMouse);

module.exports = LogicNodeMouse;