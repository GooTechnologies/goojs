import Action from './Action';



	function SetLightRangeAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetLightRangeAction.prototype = Object.create(Action.prototype);
	SetLightRangeAction.prototype.constructor = SetLightRangeAction;

	SetLightRangeAction.prototype.configure = function (settings) {
		this.everyFrame = !!settings.everyFrame;
		this.entity = settings.entity || null;
		this.range = settings.range || 100;
	};

	SetLightRangeAction.external = {
		key: 'Set Light Range',
		name: 'Set Light Range',
		description: 'Sets the range of a light.',
		parameters: [{
			name: 'Entity',
			key: 'entity',
			type: 'entity',
			description: 'Light entity.'
		}, {
			name: 'Range',
			key: 'range',
			type: 'real',
			description: 'Light range.',
			'default': 100,
			min: 0
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame.',
			'default': true
		}],
		transitions: []
	};

	SetLightRangeAction.prototype.enter = function (/*fsm*/) {
		var entity = this.entity;
		if (entity &&
			entity.lightComponent &&
			entity.lightComponent.light) {
			entity.lightComponent.light.range = this.range;
		}
	};

export default SetLightRangeAction;