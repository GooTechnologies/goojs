define(['goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/LogicComponent',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil',
	'goo/logic/LogicNodeEntityProxy',
	'goo/logic/LogicNodeTransformComponent',
	'goo/logic/LogicNodeDebug',
	'goo/logic/LogicNodeRandom',
	'goo/logic/LogicNodeVec3',
	'goo/logic/LogicNodeMultiply',
	'goo/logic/LogicNodeWASD',
	'goo/logic/LogicNodeWASD2',
	'goo/logic/LogicNodeMouse',
	'goo/logic/LogicNodeAdd',
	'goo/logic/LogicNodeSub',
	'goo/logic/LogicNodeFloat',
	'goo/logic/LogicNodeApplyMatrix',
	'goo/logic/LogicNodeConstVec3',
	'goo/logic/LogicNodeVec3Add',
	'goo/logic/LogicNodeRotationMatrix',
	'goo/logic/LogicNodeMultiplyFloat',
	'goo/logic/LogicNodeMax',
	'goo/logic/LogicNodeInt',
	'goo/logic/LogicNodeInput',
	'goo/logic/LogicNodeOutput'

], function(
	ComponentHandler,
	LogicComponent,
	RSVP,
	pu,
	_
) {
	"use strict";

	function LogicComponentHandler() {
		ComponentHandler.apply(this, arguments);
	}

	LogicComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	LogicComponentHandler.prototype.constructor = LogicComponentHandler;
	ComponentHandler._registerClass('logic', LogicComponentHandler);

	LogicComponentHandler.prototype._create = function(entity, config) {
		var c = new LogicComponent(entity);
		c.configure(config);
		entity.setComponent(c);
		return c;
	};

	LogicComponentHandler.prototype.update = function(entity, config) {
		var component = ComponentHandler.prototype.update.call(this, entity, config);
		component.configure(config);
		return pu.createDummyPromise(component);
	};

	return LogicComponentHandler;
});
