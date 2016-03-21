var LogicLayer = require('./LogicLayer');
var LogicNode = require('./LogicNode');
var LogicNodes = require('./LogicNodes');
var LogicInterface = require('./LogicInterface');

/**
 * Logic node that subtracts inputs.
 * @private
 */
function LogicNodeSub() {
	LogicNode.call(this);
	this.logicInterface = LogicNodeSub.logicInterface;
	this.type = 'LogicNodeSub';
}

LogicNodeSub.prototype = Object.create(LogicNode.prototype);
LogicNodeSub.editorName = 'Sub';

LogicNodeSub.prototype.onInputChanged = function (instDesc /*, portID, value */ ) {
	var out = LogicLayer.readPort(instDesc, LogicNodeSub.inportX) -
		LogicLayer.readPort(instDesc, LogicNodeSub.inportY);

	LogicLayer.writeValue(this.logicInstance, LogicNodeSub.outportSum, out);
};

LogicNodeSub.logicInterface = new LogicInterface();
LogicNodeSub.outportSum = LogicNodeSub.logicInterface.addOutputProperty('sum', 'float');
LogicNodeSub.inportX = LogicNodeSub.logicInterface.addInputProperty('x', 'float', 0);
LogicNodeSub.inportY = LogicNodeSub.logicInterface.addInputProperty('y', 'float', 0);

LogicNodes.registerType('LogicNodeSub', LogicNodeSub);

module.exports = LogicNodeSub;