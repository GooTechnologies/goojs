define(['goo/statemachine/actions/Action'],
/** @lends */
function(Action) {
	"use strict";

	function RotateAction(settings) {
		Action.apply(this, arguments);
	}

	RotateAction.prototype = Object.create(Action.prototype);

	RotateAction.prototype.configure = function(settings) {
		
		var parameters = RotateAction.external.parameters;

		for (var pi = 0; pi < parameters.length; pi++) {
			var parameter = parameters[pi];

			if (settings[parameter.key] != null)
				this[parameter.key] = settings[parameter.key];
			else 
				this[parameter.key] = parameter['default'];
		}
	};

	RotateAction.external = {
		parameters: [{
			name: 'Rotation',
			key: 'rotation',
			type: 'rotation',
			description: 'Rotate',
			'default': [0,0,0]
		},
		{
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true add, otherwise set',
			'default': true
		},		
		{
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Do this action every frame',
			'default': true
		}],
		transitions: []
	};

	RotateAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity != null) {
			var transform = entity.transform;
			if (this.relative) {
				transform.rotation.rotateX(this.rotation[0]*Math.PI/180);
				transform.rotation.rotateY(this.rotation[1]*Math.PI/180);
				transform.rotation.rotateZ(this.rotation[2]*Math.PI/180);

			}
			else {
				transform.setRotationXYZ(
					this.rotation[0]*Math.PI/180,
					this.rotation[1]*Math.PI/180,
					this.rotation[2]*Math.PI/180);
			}

			entity.transformComponent.setUpdated();
		}
	};

	return RotateAction;
});