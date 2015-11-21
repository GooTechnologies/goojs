var ComponentHandler = require('goo/loaders/handlers/ComponentHandler');
var LogicComponent = require('goo/entities/components/LogicComponent');
var rsvp = require('goo/util/rsvp');
var PromiseUtils = require('goo/util/PromiseUtils');
var LogicNodeEntityProxy = require('goo/logic/LogicNodeEntityProxy');
var LogicNodeTransformComponent = require('goo/logic/LogicNodeTransformComponent');
var LogicNodeMeshRendererComponent = require('goo/logic/LogicNodeMeshRendererComponent');
var LogicNodeLightComponent = require('goo/logic/LogicNodeLightComponent');
var LogicNodeDebug = require('goo/logic/LogicNodeDebug');
var LogicNodeRandom = require('goo/logic/LogicNodeRandom');
var LogicNodeTime = require('goo/logic/LogicNodeTime');
var LogicNodeSine = require('goo/logic/LogicNodeSine');
var LogicNodeVec3 = require('goo/logic/LogicNodeVec3');
var LogicNodeMultiply = require('goo/logic/LogicNodeMultiply');
var LogicNodeWASD = require('goo/logic/LogicNodeWASD');
var LogicNodeWASD2 = require('goo/logic/LogicNodeWASD2');
var LogicNodeMouse = require('goo/logic/LogicNodeMouse');
var LogicNodeAdd = require('goo/logic/LogicNodeAdd');
var LogicNodeSub = require('goo/logic/LogicNodeSub');
var LogicNodeFloat = require('goo/logic/LogicNodeFloat');
var LogicNodeApplyMatrix = require('goo/logic/LogicNodeApplyMatrix');
var LogicNodeConstVec3 = require('goo/logic/LogicNodeConstVec3');
var LogicNodeVec3Add = require('goo/logic/LogicNodeVec3Add');
var LogicNodeRotationMatrix = require('goo/logic/LogicNodeRotationMatrix');
var LogicNodeMultiplyFloat = require('goo/logic/LogicNodeMultiplyFloat');
var LogicNodeMax = require('goo/logic/LogicNodeMax');
var LogicNodeInt = require('goo/logic/LogicNodeInt');
var LogicNodeInput = require('goo/logic/LogicNodeInput');
var LogicNodeOutput = require('goo/logic/LogicNodeOutput');

'use strict';

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
