import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

var labels = {
	mousemove: 'On mouse move',
	touchmove: 'On touch move'
};

class MouseMoveAction extends Action {
	mouseEventListener: () => void;
	touchEventListener: () => void;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Mouse / Touch Move',
		name: 'Mouse / Touch Move',
		type: 'controls',
		description: 'Listens for mouse movement (mousemove) or touch movement (touchmove) on the canvas and performs a transition.',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'mousemove',
			description: 'State to transition to on mouse movement.'
		}, {
			key: 'touchmove',
			description: 'State to transition to on touch movement.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey, actionConfig){
		return labels[transitionKey];
	};

	enter (fsm) {
		var update = function (type) {
			if (type === 'mouse') {
				fsm.send(this.transitions.mousemove);
			} else {
				fsm.send(this.transitions.touchmove);
			}
		}.bind(this);

		this.mouseEventListener = function (/*event*/) {
			update('mouse');
		}.bind(this);

		this.touchEventListener = function (/*event*/) {
			update('touch');
		}.bind(this);

		document.addEventListener('mousemove', this.mouseEventListener);
		document.addEventListener('touchmove', this.touchEventListener);
	};

	exit () {
		document.removeEventListener('mousemove', this.mouseEventListener);
		document.removeEventListener('touchmove', this.touchEventListener);
	};
}

export = MouseMoveAction;