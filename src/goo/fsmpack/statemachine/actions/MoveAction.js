var Action = require('goo/fsmpack/statemachine/actions/Action');
var Vector3 = require('goo/math/Vector3');

	'use strict';

	function MoveAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	MoveAction.prototype = Object.create(Action.prototype);
	MoveAction.prototype.constructor = MoveAction;

	MoveAction.external = {
		name: 'Move',
		type: 'animation',
		description: 'Moves the entity',
		parameters: [{
			name: 'Translation',
			key: 'translation',
			type: 'position',
			description: 'Move',
			'default': [0, 0, 0]
		}, {
			name: 'Oriented',
			key: 'oriented',
			type: 'boolean',
			description: 'If true translate with rotation',
			'default': true
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true add to current translation',
			'default': true
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: []
	};

	MoveAction.prototype._setup = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.transform;
		this.forward = Vector3.fromArray(this.translation);
		var orientation = transform.rotation;
		this.forward.applyPost(orientation);
	};

	MoveAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.transform;
		var translation = transform.translation;

		if (this.oriented) {
			if (this.relative) {
				var forward = Vector3.fromArray(this.translation);
				var orientation = transform.rotation;
				forward.applyPost(orientation);

				if (this.everyFrame) {
					forward.scale(fsm.getTpf() * 10);
					translation.add(forward);
				} else {
					translation.add(forward);
				}
			} else {
				translation.set(this.forward);
			}
		} else {
			if (this.relative) {
				if (this.everyFrame) {
					var tpf = fsm.getTpf() * 10;
					translation.addDirect(this.translation[0], this.translation[1], this.translation[2])
						.scale(tpf);
				} else {
					translation.addDirect(this.translation[0], this.translation[1], this.translation[2]);
				}
			} else {
				translation.setDirect(this.translation[0], this.translation[1], this.translation[2]);
			}
		}

		entity.transformComponent.setUpdated();
	};

	module.exports = MoveAction;