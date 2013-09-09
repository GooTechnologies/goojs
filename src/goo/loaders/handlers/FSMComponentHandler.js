define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/statemachine/FSMComponent',
	'goo/renderer/bounds/BoundingBox',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil',
	'goo/statemachine/Machine'
], function(
	ComponentHandler,
	FSMComponent,
	BoundingBox,
	RSVP,
	pu,
	_,
	Machine
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

	FSMComponentHandler.prototype._create = function(entity/*, config*/) {
		var component = new FSMComponent();
		entity.setComponent(component);
		return component;
	};

	FSMComponentHandler.prototype.update = function(entity, config) {
		var that = this;
		var component = ComponentHandler.prototype.update.call(this, entity, config);

		var firstLevel = [];
		var promises = [];

		for (var i = 0; i < config.stateRefs.length; i++) {
			promises.push(that._getState(config.stateRefs[i]));
		}

		var promise = RSVP.all(promises);

		return promise.then(function(states) {
				var statesByUuid = {};
				for (var i = 0; i < states.length; i++) {
					var state = states[i];
					statesByUuid[state.uuid] = state;
				}

				// replace all uuids with actual states
				for (var i = 0; i < states.length; i++) {
					var state = states[i];
					for (var j = 0; j < state.machines.length; j++) {
						var machine = state.machines[j];

						var keys = Object.keys(machine.states);
						for (var k = 0; k < keys.length; k++) {
							var key = keys[k];
							machine.states[key] = statesByUuid[key];
						}
					}
				}

				for (var i = 0; i < config.machines.length; i++) {
					var machine = new Machine(config.machines[i].name);

					for (var j = 0; j < machine.stateRefs.length; j++) {
						var stateRef = machine.stateRefs[j];
						machine.addState(statesByUuid[stateRef]);
					}

					firstLevel.push(machine);
				}

				component.machines = firstLevel;

				return component;
			}).then(null, function(err) {
				return console.error('Error handling states ' + err);
			});
	};

	FSMComponentHandler.prototype._getState = function(ref) {
		var that = this;
		return this.getConfig(ref).then(function(config) {
			return that.updateObject(ref, config, that.options);
		});
	};

	return FSMComponentHandler;
});
