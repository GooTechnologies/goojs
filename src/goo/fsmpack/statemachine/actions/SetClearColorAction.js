var Action = require('../../../fsmpack/statemachine/actions/Action');

	'use strict';

	function SetClearColorAction(/*id, settings*/) {
		Action.apply(this, arguments);
		this._oldClearColor = [];
	}

	SetClearColorAction.prototype = Object.create(Action.prototype);
	SetClearColorAction.prototype.constructor = SetClearColorAction;

	SetClearColorAction.external = {
		key: 'Set Clear Color',
		name: 'Background Color',
		description: 'Sets the clear color',
		parameters: [{
			name: 'Color',
			key: 'color',
			type: 'vec3',
			control: 'color',
			description: 'Color',
			'default': [1, 1, 1]
		}],
		transitions: []
	};

	SetClearColorAction.prototype.ready = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var goo = entity._world.gooRunner;
		this._oldClearColor[0] = goo.renderer._clearColor.x;
		this._oldClearColor[1] = goo.renderer._clearColor.y;
		this._oldClearColor[2] = goo.renderer._clearColor.z;
		this._oldClearColor[3] = goo.renderer._clearColor.w;
	};

	SetClearColorAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var goo = entity._world.gooRunner;
		goo.renderer.setClearColor(this.color[0], this.color[1], this.color[2], 1);
	};

	SetClearColorAction.prototype.cleanup = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity) {
			var goo = entity._world.gooRunner;
			goo.renderer.setClearColor(
				this._oldClearColor[0],
				this._oldClearColor[1],
				this._oldClearColor[2],
				this._oldClearColor[3]
			);
		}
	};

	module.exports = SetClearColorAction;