var Action = require('../../../fsmpack/statemachine/actions/Action');

function ScaleAction() {
	Action.apply(this, arguments);
}

ScaleAction.prototype = Object.create(Action.prototype);
ScaleAction.prototype.constructor = ScaleAction;

ScaleAction.external = {
	key: 'Scale',
	name: 'Scale',
	type: 'animation',
	description: 'Scales the entity.',
	parameters: [{
		name: 'Scale',
		key: 'scale',
		type: 'position',
		description: 'Scale.',
		'default': [0, 0, 0]
	}, {
		name: 'Relative',
		key: 'relative',
		type: 'boolean',
		description: 'If true, add/multiply the current scaling.',
		'default': true
	}, {
		name: 'Multiply',
		key: 'multiply',
		type: 'boolean',
		description: 'If true multiply, otherwise add.',
		'default': false
	}, {
		name: 'On every frame',
		key: 'everyFrame',
		type: 'boolean',
		description: 'Repeat this action every frame.',
		'default': false
	}],
	transitions: []
};

ScaleAction.prototype.applyScale = function () {
	var entity = this.getEntity();
	var transform = entity.transformComponent.transform;
	if (this.relative) {
		if (this.multiply) {
			if (this.everyFrame) {
				var tpf = entity._world.tpf * 10;
				transform.scale.x *= this.scale[0] * tpf;
				transform.scale.y *= this.scale[1] * tpf;
				transform.scale.z *= this.scale[2] * tpf;
			} else {
				transform.scale.mulDirect(this.scale[0], this.scale[1], this.scale[2]);
			}
		} else {
			if (this.everyFrame) {
				var tpf = entity._world.tpf * 10;
				transform.scale.x += this.scale[0] * tpf;
				transform.scale.y += this.scale[1] * tpf;
				transform.scale.z += this.scale[2] * tpf;
			} else {
				transform.scale.addDirect(this.scale[0], this.scale[1], this.scale[2]);
			}
		}
	} else {
		transform.scale.setArray(this.scale);
	}

	entity.transformComponent.setUpdated();
};

ScaleAction.prototype.enter = function () {
	if (!this.everyFrame) {
		this.applyScale();
	}
};

ScaleAction.prototype.update = function () {
	if (this.everyFrame) {
		this.applyScale();
	}
};

module.exports = ScaleAction;