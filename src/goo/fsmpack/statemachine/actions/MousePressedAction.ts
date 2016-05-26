import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

var labels = {
	mousedown: 'Mouse Button Pressed'
};

class MousePressedAction extends Action {
	button: string;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Mouse Button Pressed',
		name: 'Mouse Button Pressed',
		type: 'controls',
		description: 'Listens for a mouse button press event and performs a transition. Works over transition boundaries..',
		canTransition: true,
		parameters: [{
			name: 'Button',
			key: 'button',
			type: 'string',
			control: 'dropdown',
			description: 'Mouse Button to listen for.',
			'default': 'Left',
			options: ['Left', 'Middle', 'Right']
		}],
		transitions: [{
			key: 'mousedown',
			description: 'State to transition to when the mouse button is pressed.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey, actionConfig){
		if (labels[transitionKey]) {
			return 'On ' + actionConfig.options.button + ' ' + labels[transitionKey];
		}
	};

	enter (fsm) {
		if (fsm.getInputState(this.button)) {
			fsm.send(this.transitions.mousedown);
		}
	};

	update (fsm) {
		if (fsm.getInputState(this.button)) {
			fsm.send(this.transitions.mousedown);
		}
	};
}

export = MousePressedAction;