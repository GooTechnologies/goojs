import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class PauseAnimationAction extends Action {
	onAll: boolean;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Pause Animation',
		name: 'Pause Animation',
		type: 'animation',
		description: 'Pauses skeleton animations.',
		parameters: [{
			name: 'On all entities',
			key: 'onAll',
			type: 'boolean',
			description: 'Pause animation on all entities or just one.',
			'default': false
		}],
		transitions: []
	};

	enter (fsm) {
		if (this.onAll) {
			var world = fsm.getWorld();
			var animationSystem = world.getSystem('AnimationSystem');
			animationSystem.pause();
		} else {
			var entity = fsm.getOwnerEntity();
			if (entity.animationComponent) {
				entity.animationComponent.pause();
			}
		}
	};
}

export = PauseAnimationAction;