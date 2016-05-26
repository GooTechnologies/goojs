import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class SetLightRangeAction extends Action {
	entity: any;
	range: number;
	everyFrame: boolean;
	constructor(id: string, options: any){
		super(id, options);
	}

	configure (settings) {
		this.everyFrame = !!settings.everyFrame;
		this.entity = settings.entity || null;
		this.range = settings.range || 100;
	};

	static external: External = {
		key: 'Set Light Range',
		name: 'Set Light Range',
		description: 'Sets the range of a light.',
		type: 'light',
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

	enter (fsm) {
		var entity = this.entity;
		if (entity &&
			entity.lightComponent &&
			entity.lightComponent.light) {
			entity.lightComponent.light.range = this.range;
		}
	};
}

export = SetLightRangeAction;