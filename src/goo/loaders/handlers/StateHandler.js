define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/renderer/MeshData',
	'goo/animation/SkeletonPose',
	'goo/loaders/JsonUtils',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil',
	'goo/util/ArrayUtil'
], function(
	ConfigHandler,
	MeshData,
	SkeletonPose,
	JsonUtils,
	PromiseUtil,
	_,
	ArrayUtil
) {
	function StateHandler() {
		ConfigHandler.apply(this, arguments);
		this._objects = {};
	}

	StateHandler.actions = {
		AddPositionAction: AddPositionAction
	};

	StateHandler.prototype = Object.create(ConfigHandler.prototype);
	ConfigHandler._registerClass('state', StateHandler);

	StateHandler.prototype.update = function(ref, config) {
		var uuid = config.uuid;
		var state = new State(uuid);

		// actions
		for (var i = 0; i < config.actions.length; i++) {
			var action = config.actions[i];
			var actionType = action.type;
			var actionOptions = action.options;
			if (StateHandler.actions[actionType] instanceof Function) {
				state.actions.push(new StateHandler.actions[actionType](actionOptions));
			}
		}

		// machines (layers)
		for (var i = 0; i < config.layers.length; i++) {
			var layer = config.layers[i];
			var layerName = layer.name;
			var initialState = layer.initialState;

			// an array of uuids to other states
			// store them initially as uuids and after every state is loaded do a replace on all
		}

		// vars

		return PromiseUtil.createDummyPromise(state);
	};

	return StateHandler;
});