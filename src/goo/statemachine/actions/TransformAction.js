define(['goo/statemachine/actions/Action'],
/** @lends */
function(Action) {
	"use strict";

	function TransformAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TransformAction.prototype = Object.create(Action.prototype);

	TransformAction.prototype.configure = function(settings) {
		var parameters = TransformAction.external.parameters;

		for (var pi = 0; pi < parameters.length; pi++) {
			var parameter = parameters[pi];

			if (settings[parameter.key] != null) {
				this[parameter.key] = settings[parameter.key];
			} else {
				this[parameter.key] = parameter['default'];
			}
		}
	};

	TransformAction.external = {
		parameters: [{
			name: 'Translation',
			key: 'translation',
			type: 'position',
			description: 'Move',
			'default': [-2,0,0]
		}, {
			name: 'Rotation',
			key: 'rotation',
			type: 'rotation',
			description: 'Rotate',
			'default': [0,0,0]
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true add, otherwise set',
			'default': true
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Do this action every frame',
			'default': true
		}],
		transitions: []
	};

	TransformAction.prototype._run = function(fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity != null) {
			var transform = entity.transformComponent.transform;
			if (this.relative) {
				transform.translation.add(this.translation);
				transform.rotation.rotateX(this.rotation[0]*Math.PI/180);
				transform.rotation.rotateY(this.rotation[1]*Math.PI/180);
				transform.rotation.rotateZ(this.rotation[2]*Math.PI/180);
			}
			else {
				transform.translation.set(this.translation);
				transform.setRotationXYZ(
					this.rotation[0]*Math.PI/180,
					this.rotation[1]*Math.PI/180,
					this.rotation[2]*Math.PI/180);
			}

			entity.transformComponent.setUpdated();
		}
	};

	return TransformAction;
});