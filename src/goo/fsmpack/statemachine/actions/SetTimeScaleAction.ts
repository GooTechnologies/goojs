import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class SetTimeScaleAction extends Action {
	scale: number;
	everyFrame: boolean;
	constructor(id: string, options: any){
		super(id, options);
		this.everyFrame = false;
	}

	static external: External = {
		key: 'Set Animation Time Scale',
		name: 'Set Animation Time Scale',
		type: 'animation',
		description: 'Sets the time scale for the current animation.',
		parameters: [{
			name: 'Scale',
			key: 'scale',
			type: 'float',
			description: 'Scale factor for the animation timer.',
			'default': 1
		}],
		transitions: []
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.animationComponent) {
			entity.animationComponent.setTimeScale(this.scale);
		}
	}
};

export = SetTimeScaleAction;