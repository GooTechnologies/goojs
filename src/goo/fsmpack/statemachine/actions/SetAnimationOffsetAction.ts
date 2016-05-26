import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class SetAnimationOffsetAction extends Action {
	offset: number;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Set Animation Offset',
		name: 'Set Animation Offset',
		type: 'animation',
		description: 'Sets animation clip offset.',
		parameters: [{
			name: 'Offset (sec)',
			key: 'offset',
			type: 'float',
			description: 'Animation offset',
			'default': 0
		}],
		transitions: []
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.animationComponent) {
			entity.animationComponent.shiftClipTime(this.offset);
		}
	};
}

export = SetAnimationOffsetAction;