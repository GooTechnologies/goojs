define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/statemachine/FSMComponent',
	'goo/util/rsvp',
	'goo/util/PromiseUtil'
], function(
	ComponentHandler,
	FSMComponent,
	RSVP,
	PromiseUtil
	) {

	function FSMComponentHandler() {
		ComponentHandler.apply(this, arguments);
	}
	FSMComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	FSMComponentHandler.prototype.constructor = FSMComponentHandler;
	ComponentHandler._registerClass('fsm', FSMComponentHandler);

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
		} else {
			promises.push(PromiseUtil.createDummyPromise());
		}
		return RSVP.all(promises).then(function(machines) {
			for (var i = 0; i < machines.length; i++) {
				component.addMachine(machines[i]);
			}
		});
	};

	return FSMComponentHandler;
});