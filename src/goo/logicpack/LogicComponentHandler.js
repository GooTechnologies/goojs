var ComponentHandler = require('../loaders/handlers/ComponentHandler');
var LogicComponent = require('./LogicComponent');
var PromiseUtils = require('../util/PromiseUtils');
var LogicNodeEntityProxy = require('./logic/LogicNodeEntityProxy');
var LogicNodeTransformComponent = require('./logic/LogicNodeTransformComponent');
var LogicNodeMeshRendererComponent = require('./logic/LogicNodeMeshRendererComponent');
var LogicNodeLightComponent = require('./logic/LogicNodeLightComponent');
var LogicNodeDebug = require('./logic/LogicNodeDebug');
var LogicNodeRandom = require('./logic/LogicNodeRandom');
var LogicNodeTime = require('./logic/LogicNodeTime');
var LogicNodeSine = require('./logic/LogicNodeSine');
var LogicNodeVec3 = require('./logic/LogicNodeVec3');
var LogicNodeMultiply = require('./logic/LogicNodeMultiply');
var LogicNodeWASD = require('./logic/LogicNodeWASD');
var LogicNodeWASD2 = require('./logic/LogicNodeWASD2');
var LogicNodeMouse = require('./logic/LogicNodeMouse');
var LogicNodeAdd = require('./logic/LogicNodeAdd');
var LogicNodeSub = require('./logic/LogicNodeSub');
var LogicNodeFloat = require('./logic/LogicNodeFloat');
var LogicNodeApplyMatrix = require('./logic/LogicNodeApplyMatrix');
var LogicNodeConstVec3 = require('./logic/LogicNodeConstVec3');
var LogicNodeVec3Add = require('./logic/LogicNodeVec3Add');
var LogicNodeRotationMatrix = require('./logic/LogicNodeRotationMatrix');
var LogicNodeMultiplyFloat = require('./logic/LogicNodeMultiplyFloat');
var LogicNodeMax = require('./logic/LogicNodeMax');
var LogicNodeInt = require('./logic/LogicNodeInt');
var LogicNodeInput = require('./logic/LogicNodeInput');
var LogicNodeOutput = require('./logic/LogicNodeOutput');

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
