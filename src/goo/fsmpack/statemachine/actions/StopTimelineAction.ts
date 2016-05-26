import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class StopTimelineAction extends Action {
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Stop Timeline',
		name: 'Stop Timeline',
		type: 'timeline',
		description: 'Stops the timeline.',
		canTransition: true,
		parameters: [],
		transitions: []
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();

		if (!entity.hasComponent('TimelineComponent')) { return; }

		entity.timelineComponent.stop();
	};
}

export = StopTimelineAction;