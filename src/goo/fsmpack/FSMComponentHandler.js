define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/fsmpack/statemachine/FSMComponent',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ArrayUtil'
], function(
	ComponentHandler,
	FSMComponent,
	RSVP,
	PromiseUtil,
	ArrayUtil
	) {
	"use strict";

	function FSMComponentHandler() {
		ComponentHandler.apply(this, arguments);
	}
	FSMComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	FSMComponentHandler.prototype.constructor = FSMComponentHandler;
	ComponentHandler._registerClass('stateMachine', FSMComponentHandler);
	FSMComponentHandler._type = 'fSM';

	FSMComponentHandler.prototype._prepare = function(/*config*/) {};

	FSMComponentHandler.prototype._create = function(entity/*, config*/) {
		var component = new FSMComponent();
		entity.setComponent(component);
		return component;
	};

	FSMComponentHandler.prototype.update = function(entity, config) {
		var that = this, promises = [];
		function update(ref) {
			return that.getConfig(ref).then(function(config) {
				return that.updateObject(ref, config);
			});
		}
		var component = ComponentHandler.prototype.update.call(this, entity, config);
		if (config.machineRefs && config.machineRefs.length) {
			var refs = config.machineRefs;
			for (var i = 0; i < refs.length; i++) {
				promises.push(update(refs[i]));
			}
		}

		if (promises.length > 0) {
			return RSVP.all(promises).then(function(machines) {
				var oldMachines = component._machines;
				component._machines = [];
				for (var i = 0; i < machines.length; i++) {
					component.addMachine(machines[i]);
					ArrayUtil.remove(oldMachines, machines[i]);
				}
				for (var i = 0; i < oldMachines.length; i++) {
					component.removeMachine(oldMachines[i]);
				}
				return component;
			});
		}
		else {
			return PromiseUtil.createDummyPromise(component);
		}
	};

	return FSMComponentHandler;
});