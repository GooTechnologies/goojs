var LogicLayer = require('./LogicLayer');
var LogicNode = require('./LogicNode');
var LogicNodes = require('./LogicNodes');
var LogicInterface = require('./LogicInterface');
var TransformComponent = require('../../entities/components/TransformComponent');
var Vector3 = require('../../math/Vector3');
var Matrix3 = require('../../math/Matrix3')

/**
 * Logic node that connects to the transform component of an entity.
 * @private
 */
function LogicNodeTransformComponent() {
	LogicNode.call(this);
	this.logicInterface = LogicNodeTransformComponent.logicInterface;
	this.type = 'TransformComponent';
}

LogicNodeTransformComponent.prototype = Object.create(LogicNode.prototype);
LogicNodeTransformComponent.editorName = 'TransformComponent';

LogicNodeTransformComponent.prototype.onConfigure = function (config) {
	this.entityRef = config.entityRef; //
};

LogicNodeTransformComponent.prototype.onInputChanged = function (instDesc, portID, value) {
	var entity = LogicLayer.resolveEntityRef(instDesc, this.entityRef);
	var transformComponent = entity.transformComponent;

	if (portID === LogicNodeTransformComponent.inportPos) {
		transformComponent.setTranslation(value);
	} else if (portID === LogicNodeTransformComponent.inportRot) {
		transformComponent.setRotation(value[0], value[1], value[2]);
	} else if (portID === LogicNodeTransformComponent.inportScale) {
		transformComponent.setScale(value);
	}
	LogicLayer.writeValue(this.logicInstance, LogicNodeTransformComponent.outportPos, entity.transformComponent.transform.translation.clone());
	LogicLayer.writeValue(this.logicInstance, LogicNodeTransformComponent.outportRot, entity.transformComponent.transform.rotation.clone());
};

LogicNodeTransformComponent.logicInterface = new LogicInterface('Transform');
LogicNodeTransformComponent.inportPos = LogicNodeTransformComponent.logicInterface.addInputProperty('position', 'Vector3', new Vector3(0, 0, 0));
LogicNodeTransformComponent.inportRot = LogicNodeTransformComponent.logicInterface.addInputProperty('rotation', 'Vector3', new Vector3(0, 0, 0));
LogicNodeTransformComponent.inportScale = LogicNodeTransformComponent.logicInterface.addInputProperty('scale', 'Vector3', new Vector3(1, 1, 1));
LogicNodeTransformComponent.outportPos = LogicNodeTransformComponent.logicInterface.addOutputProperty('outpos', 'Vector3', new Vector3());
LogicNodeTransformComponent.outportRot = LogicNodeTransformComponent.logicInterface.addOutputProperty('rotmat', 'Matrix3', new Matrix3());
LogicNodeTransformComponent.logicInterface.addConfigEntry({
	name: 'entityRef',
	type: 'entityRef',
	label: 'Entity'
});


LogicNodes.registerType('TransformComponent', LogicNodeTransformComponent);

module.exports = LogicNodeTransformComponent;