var Action = require('../../../fsmpack/statemachine/actions/Action');

function AddPositionAction() {
	Action.apply(this, arguments);
}

AddPositionAction.prototype = Object.create(Action.prototype);
AddPositionAction.prototype.constructor = AddPositionAction;

AddPositionAction.external = {
	parameters: [{
		name: 'Entity',
		key: 'entity',
		type: 'entity',
		description: 'Entity to move.'
	}, {
		name: 'Amount X',
		key: 'amountX',
		type: 'float',
		description: 'Amount to move on the X axis.',
		'default': 0
	}, {
		name: 'Amount Y',
		key: 'amountY',
		type: 'float',
		description: 'Amount to move on the Y axis.',
		'default': 0
	}, {
		name: 'Amount Z',
		key: 'amountZ',
		type: 'float',
		description: 'Amount to move on the Z axis.',
		'default': 0
	}, {
		name: 'Speed',
		key: 'speed',
		type: 'float',
		description: 'Speed to multiply.',
		'default': 1
	}, {
		name: 'On every frame',
		key: 'everyFrame',
		type: 'boolean',
		description: 'Repeat this action every frame.',
		'default': true
	}],
	transitions: []
};

AddPositionAction.prototype.addPosition = function () {
	var entity = this.entity;

	if (!entity) {
		return;
	}

	var tpf = entity._world.tpf;

	var dx = this.amountX;
	var dy = this.amountY;
	var dz = this.amountZ;

	var speedTpf = this.speed * tpf;

	entity.transformComponent.addTranslation(
		dx * speedTpf,
		dy * speedTpf,
		dz * speedTpf
	);
};

AddPositionAction.prototype.enter = function (fsm) {
	if (!this.everyFrame) {
		this.addPosition(fsm);
	}
};

AddPositionAction.prototype.update = function (fsm) {
	if (this.everyFrame) {
		this.addPosition(fsm);
	}
};

module.exports = AddPositionAction;
