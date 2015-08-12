define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/fsmpack/statemachine/StateMachineComponent',
	'goo/util/rsvp',
	'goo/util/ObjectUtils'
], function (
	ComponentHandler,
	StateMachineComponent,
	RSVP,
	_
) {
	'use strict';

	/**
	 * For handling loading of state machine components
	 * @param {World} world The goo world
	 * @param {Function} getConfig The config loader function. See {@see DynamicLoader._loadRef}.
	 * @param {Function} updateObject The handler function. See {@see DynamicLoader.update}.
	 * @extends ComponentHandler
	 * @hidden
	 */
	function StateMachineComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'StateMachineComponent';
	}

	StateMachineComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	StateMachineComponentHandler.prototype.constructor = StateMachineComponentHandler;
	ComponentHandler._registerClass('stateMachine', StateMachineComponentHandler);

	/**
	 * Create statemachine component
	 * @returns {StateMachineComponent} the created component object
	 * @hidden
	 */
	StateMachineComponentHandler.prototype._create = function () {
		return new StateMachineComponent();
	};

	/**
	 * Update engine statemachine component object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	StateMachineComponentHandler.prototype.update = function (entity, config, options) {
		var that = this;
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			var promises = [];
			_.forEach(config.machines, function (machineCfg) {
				promises.push(that._load(machineCfg.machineRef, options));
			}, null, 'sortValue');

			return RSVP.all(promises).then(function (machines) {
				// Adding new machines
				for (var i = 0; i < machines.length; i++) {
					if (component._machines.indexOf(machines[i]) === -1) {
						component.addMachine(machines[i]);
					}
				}
				// Removing old machines
				for (var i = 0; i < component._machines.length; i++) {
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