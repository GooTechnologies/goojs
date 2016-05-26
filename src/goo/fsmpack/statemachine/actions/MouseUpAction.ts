import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

var labels = {
	mouseLeftUp: 'On left mouse up',
	middleMouseUp: 'On middle mouse up',
	rightMouseUp: 'On right mouse up',
	touchUp: 'On touch end'
};

class MouseUpAction extends Action {
	mouseEventListener: () => void;
	touchEventListener: () => void;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'Mouse Up / Touch end',
		name: 'Mouse Up / Touch end',
		type: 'controls',
		description: 'Listens for a mouseup event (or touchend) on the canvas and performs a transition.',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'mouseLeftUp',
			description: 'State to transition to when the left mouse button is released.'
		}, {
			key: 'middleMouseUp',
			description: 'State to transition to when the middle mouse button is released.'
		}, {
			key: 'rightMouseUp',
			description: 'State to transition to when the right mouse button is released.'
		}, {
			key: 'touchUp',
			description: 'State to transition to when the touch event ends.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (transitionKey, actionConfig){
		return labels[transitionKey];
	};

	enter (fsm) {
		var update = function (button) {
			if (button === 'touch') {
				fsm.send(this.transitions.touchUp);
			} else {
				fsm.send([
					this.transitions.mouseLeftUp,
					this.transitions.middleMouseUp,
					this.transitions.rightMouseUp
				][button]);
			}
		}.bind(this);

		this.mouseEventListener = function (event) {
			update(event.button);
		}.bind(this);

		this.touchEventListener = function () {
			update('touch');
		}.bind(this);

		document.addEventListener('mouseup', this.mouseEventListener);
		document.addEventListener('touchend', this.touchEventListener);
	};

	exit (fsm) {
		document.removeEventListener('mouseup', this.mouseEventListener);
		document.removeEventListener('touchend', this.touchEventListener);
	};
}

export = MouseUpAction;