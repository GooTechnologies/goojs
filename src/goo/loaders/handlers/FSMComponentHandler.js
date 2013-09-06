define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/statemachine/FSMComponent',
	'goo/renderer/bounds/BoundingBox',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil'
], function(
	ComponentHandler,
	FSMComponent,
	BoundingBox,
	RSVP,
	pu,
	_
) {
	function FSMComponentHandler() {
		ComponentHandler.apply(this, arguments);
	}

	FSMComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	ComponentHandler._registerClass('fsmComponent', FSMComponentHandler);

	FSMComponentHandler.prototype._prepare = function(config) {
		return _.defaults(config, {

		});
	};

	FSMComponentHandler.prototype._create = function(entity, config) {
		var component = new FSMComponent();
		entity.setComponent(component);
		return component;
	};

	FSMComponentHandler.prototype.update = function(entity, config) {
		var that = this;
		ComponentHandler.prototype.update.call(this, entity, config);
	};

	return FSMComponentHandler;
});
