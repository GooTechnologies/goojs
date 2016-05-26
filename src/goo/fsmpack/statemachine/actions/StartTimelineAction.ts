import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class StartTimelineAction extends Action {
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Start Timeline',
		name: 'Start Timeline',
		type: 'timeline',
		description: 'Starts or resumes the timeline.',
		canTransition: true,
		parameters: [],
		transitions: []
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();

		if (!entity.hasComponent('TimelineComponent')) { return; }

		entity.timelineComponent.start();
	};

}

export = StartTimelineAction;