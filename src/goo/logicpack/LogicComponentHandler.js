var ComponentHandler = require('../loaders/handlers/ComponentHandler');
var LogicComponent = require('./LogicComponent');
var PromiseUtils = require('../util/PromiseUtils');

// TODO: include somewhere else
require('./logic/LogicNodeEntityProxy');
require('./logic/LogicNodeTransformComponent');
require('./logic/LogicNodeMeshRendererComponent');
require('./logic/LogicNodeLightComponent');
require('./logic/LogicNodeDebug');
require('./logic/LogicNodeRandom');
require('./logic/LogicNodeTime');
require('./logic/LogicNodeSine');
require('./logic/LogicNodeVec3');
require('./logic/LogicNodeMultiply');
require('./logic/LogicNodeWASD');
require('./logic/LogicNodeWASD2');
require('./logic/LogicNodeMouse');
require('./logic/LogicNodeAdd');
require('./logic/LogicNodeSub');
require('./logic/LogicNodeFloat');
require('./logic/LogicNodeApplyMatrix');
require('./logic/LogicNodeConstVec3');
require('./logic/LogicNodeVec3Add');
require('./logic/LogicNodeRotationMatrix');
require('./logic/LogicNodeMultiplyFloat');
require('./logic/LogicNodeMax');
require('./logic/LogicNodeInt');
require('./logic/LogicNodeInput');
require('./logic/LogicNodeOutput');

/**
* 	* @private
*/
function LogicComponentHandler() {
	ComponentHandler.apply(this, arguments);
}

LogicComponentHandler.prototype = Object.create(ComponentHandler.prototype);
LogicComponentHandler.prototype.constructor = LogicComponentHandler;
ComponentHandler._registerClass('logic', LogicComponentHandler);

LogicComponentHandler.prototype._create = function (entity, config) {
	var c = new LogicComponent(entity);
	c.configure(config);
	entity.setComponent(c);
	return c;
};

LogicComponentHandler.prototype.update = function (entity, config) {
	var component = ComponentHandler.prototype.update.call(this, entity, config);
	component.configure(config);
	return PromiseUtils.resolve(component);
};

module.exports = LogicComponentHandler;
