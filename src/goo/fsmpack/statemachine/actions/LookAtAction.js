var Action = require('../../../fsmpack/statemachine/actions/Action');
var Vector3 = require('../../../math/Vector3');

	'use strict';

	function LookAtAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	LookAtAction.prototype = Object.create(Action.prototype);
	LookAtAction.prototype.constructor = LookAtAction;

	LookAtAction.external = {
		key: 'Look At',
		name: 'Look At',
		type: 'animation',
		description: 'Reorients an entity so that it\'s facing a specific point.',
		parameters: [{
			name: 'Look at',
			key: 'lookAt',
			type: 'position',
			description: 'Position to look at.',
			'default': [0, 0, 0]
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: []
	};

	LookAtAction.prototype.doLookAt = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;

		transformComponent.transform.lookAt(new Vector3(this.lookAt), Vector3.UNIT_Y);
		transformComponent.setUpdated();
	};

	LookAtAction.prototype.enter = function (fsm) {
		if (!this.everyFrame) {
			this.doLookAt(fsm);
		}
	};

	LookAtAction.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this.doLookAt(fsm);
		}
	};

	module.exports = LookAtAction;