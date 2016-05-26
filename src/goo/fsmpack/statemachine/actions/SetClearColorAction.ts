import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class SetClearColorAction extends Action {
	color: Array<number>;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Set Clear Color',
		name: 'Background Color',
		type: 'misc',
		description: 'Sets the clear color.',
		parameters: [{
			name: 'Color',
			key: 'color',
			type: 'vec4',
			control: 'color',
			description: 'Color.',
			'default': [1, 1, 1, 1]
		}],
		transitions: []
	};

	enter (fsm) {
		var entity = fsm.getOwnerEntity();
		var color = this.color;
		entity._world.gooRunner.renderer.setClearColor(color[0], color[1], color[2], color[3]);
	};
}

export = SetClearColorAction;