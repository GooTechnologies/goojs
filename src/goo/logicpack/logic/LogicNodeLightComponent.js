var LogicLayer = require('./LogicLayer');
var LogicNode = require('./LogicNode');
var LogicNodes = require('./LogicNodes');
var LogicInterface = require('./LogicInterface');

/**
 * Logic node connecting to the LightComponent of an entity.
 * @private
 */
function LogicNodeLightComponent() {
	LogicNode.call(this);
	this.logicInterface = LogicNodeLightComponent.logicInterface;
	this.type = 'LightComponent';
}

LogicNodeLightComponent.prototype = Object.create(LogicNode.prototype);
LogicNodeLightComponent.editorName = 'LightComponent';

LogicNodeLightComponent.prototype.onConfigure = function (config) {
	this.entityRef = config.entityRef;
};

// Logic interface set-up
LogicNodeLightComponent.logicInterface = new LogicInterface('LightComponent');
LogicNodeLightComponent.inportIntensity = LogicNodeLightComponent.logicInterface.addInputProperty('Intensity', 'float');
LogicNodeLightComponent.inportRange = LogicNodeLightComponent.logicInterface.addInputProperty('Range', 'float');

LogicNodeLightComponent.prototype.onInputChanged = function (instDesc, propID, value) {
	var entity = LogicLayer.resolveEntityRef(instDesc, this.entityRef);
	if (propID === LogicNodeLightComponent.inportIntensity) {
		entity.lightComponent.light.intensity = value;
	} else if (propID === LogicNodeLightComponent.inportRange) {
		entity.lightComponent.light.range = value;
	}
};

LogicNodeLightComponent.logicInterface.addConfigEntry({ name: 'entityRef', type: 'entityRef', label: 'Entity'});
LogicNodes.registerType('LightComponent', LogicNodeLightComponent);

module.exports = LogicNodeLightComponent;