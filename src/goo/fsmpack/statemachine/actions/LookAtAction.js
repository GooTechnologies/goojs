var Action = require('../../../fsmpack/statemachine/actions/Action');
var Vector3 = require('../../../math/Vector3');

function LookAtAction() {
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

LookAtAction.prototype.doLookAt = function () {
	var entity = this.getEntity();
	var transformComponent = entity.transformComponent;

	transformComponent.transform.lookAt(new Vector3(this.lookAt), Vector3.UNIT_Y); // TODO: dont create new vectors each frame
	transformComponent.setUpdated();
};

LookAtAction.prototype.enter = function () {
	if (!this.everyFrame) {
		this.doLookAt();
	}
};

LookAtAction.prototype.update = function () {
	if (this.everyFrame) {
		this.doLookAt();
	}
};

module.exports = LookAtAction;