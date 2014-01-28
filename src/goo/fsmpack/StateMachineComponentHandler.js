define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/fsmpack/statemachine/StateMachineComponent',
	'goo/util/rsvp'
], function(
	ComponentHandler,
	StateMachineComponent,
	RSVP
	) {
	"use strict";

	function StateMachineComponentHandler() {
		ComponentHandler.apply(this, arguments);
		// TODO Change to StateMachineComponent;
		this._type = 'StateMachineComponent';
	}

	StateMachineComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	StateMachineComponentHandler.prototype.constructor = StateMachineComponentHandler;
	ComponentHandler._registerClass('stateMachine', StateMachineComponentHandler);

	StateMachineComponentHandler.prototype._create = function() {
		// TODO change
		return new StateMachineComponent();
	};

	StateMachineComponentHandler.prototype.update = function(entity, config, options) {
		var that = this;
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function(component) {
			var promises = [];
			for (var key in config.machineRefs) {
				promises.push(that._load(config.machineRefs[key], options));
			}
			return RSVP.all(promises).then(function(machines) {
				// Adding new machines
				for (var i = 0; i < machines.length; i++) {
					if (component._machines.indexOf(machines[i]) === -1) {
						component.addMachine(machines[i]);
					}
				}
				// Removing old machines
				for (var i = 0; i < component._machines.length; i++) {
					if (machines.indexOf(component._machines[i]) === -1) {
						component.removeMachine(component._machines[i]);
					}
				}
				return component;
			});
		});
	};

	return StateMachineComponentHandler;
});