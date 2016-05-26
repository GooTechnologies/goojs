import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class PauseTimelineAction extends Action {
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Pause Timeline',
		name: 'Pause Timeline',
		type: 'timeline',
		description: 'Pauses the timeline.',
		canTransition: true,
		parameters: [],
		transitions: []
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();

		if (!entity.hasComponent('TimelineComponent')) { return; }

		entity.timelineComponent.pause();
	};
}

export = PauseTimelineAction;