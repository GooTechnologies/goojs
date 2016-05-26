import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

var labels = {
	mouseLeftDown: 'On left mouse down',
	middleMouseDown: 'On middle mouse down',
	rightMouseDown: 'On right mouse down',
	touchDown: 'On touch start'
};

class MouseDownAction extends Action {
	touchEventListener: () => void;
	mouseEventListener: () => void;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Mouse Down / Touch Start',
		name: 'Mouse Down / Touch Start',
		type: 'controls',
		description: 'Listens for a mousedown event (or touchstart) on the canvas and performs a transition.',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'mouseLeftDown',
			description: 'State to transition to when the left mouse button is pressed.'
		}, {
			key: 'middleMouseDown',
			description: 'State to transition to when the middle mouse button is pressed.'
		}, {
			key: 'rightMouseDown',
			description: 'State to transition to when the right mouse button is pressed.'
		}, {
			key: 'touchDown',
			description: 'State to transition to when the touch event begins.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey, actionConfig){
		return labels[transitionKey];
	};

	enter (fsm) {
		var update = function (button) {
			if (button === 'touch') {
				fsm.send(this.transitions.touchDown);
			} else {
				fsm.send([
					this.transitions.mouseLeftDown,
					this.transitions.middleMouseDown,
					this.transitions.rightMouseDown
				][button]);
			}
		}.bind(this);

		this.mouseEventListener = function (event) {
			update(event.button);
		}.bind(this);

		this.touchEventListener = function () {
			update('touch');
		}.bind(this);

		document.addEventListener('mousedown', this.mouseEventListener);
		document.addEventListener('touchstart', this.touchEventListener);
	};

	exit () {
		document.removeEventListener('mousedown', this.mouseEventListener);
		document.removeEventListener('touchstart', this.touchEventListener);
	};
}

export = MouseDownAction;