var LogicLayer = require('./LogicLayer');
var LogicNode = require('./LogicNode');
var LogicNodes = require('./LogicNodes');
var LogicInterface = require('./LogicInterface');
var Vector3 = require('../../math/Vector3');

/**
 * Logic node to provide a const Vec3
 * @private
 */
function LogicNodeConstVec3() {
	LogicNode.call(this);
	this.logicInterface = LogicNodeConstVec3.logicInterface;
	this.type = 'LogicNodeConstVec3';
}

LogicNodeConstVec3.prototype = Object.create(LogicNode.prototype);
LogicNodeConstVec3.editorName = 'ConstVec3';

LogicNodeConstVec3.prototype.onConfigure = function (newConfig) {
	if (newConfig.value !== undefined) {
		this.value = newConfig.value;
		LogicLayer.writeValue(this.logicInstance, LogicNodeConstVec3.outportVec, new Vector3(this.x, this.y, this.z));
	}
};

LogicNodeConstVec3.prototype.onSystemStarted = function () {
	LogicLayer.writeValue(this.logicInstance, LogicNodeConstVec3.outportVec, new Vector3(this.x, this.y, this.z));
};

LogicNodes.registerType('LogicNodeConstVec3', LogicNodeConstVec3);

LogicNodeConstVec3.logicInterface = new LogicInterface();
LogicNodeConstVec3.outportVec = LogicNodeConstVec3.logicInterface.addOutputProperty('xyz', 'Vector3');

LogicNodeConstVec3.logicInterface.addConfigEntry({
	name: 'x',
	type: 'float',
	label: 'X'
});

LogicNodeConstVec3.logicInterface.addConfigEntry({
	name: 'y',
	type: 'float',
	label: 'Y'
});

LogicNodeConstVec3.logicInterface.addConfigEntry({
	name: 'z',
	type: 'float',
	label: 'Z'
});

module.exports = LogicNodeConstVec3;