import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class ResumeAnimationAction extends Action {
	onAll: boolean;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Resume Animation',
		name: 'Resume Animation',
		type: 'animation',
		description: 'Continues playing a skeleton animation.',
		parameters: [{
			name: 'On all entities',
			key: 'onAll',
			type: 'boolean',
			description: 'Resume animation on all entities or just one.',
			'default': false
		}],
		transitions: []
	};

	enter (fsm) {
		if (this.onAll) {
			var world = fsm.getWorld();
			var animationSystem = world.getSystem('AnimationSystem');
			animationSystem.resume();
		} else {
			var entity = fsm.getOwnerEntity();
			if (entity.animationComponent) {
				entity.animationComponent.resume();
			}
		}
	};
}

export = ResumeAnimationAction;