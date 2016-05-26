import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class HtmlAction extends Action {
	eventListener: () => void;
	domElement: Element;
	constructor(id: string, options: any){
		super(id, options);
	}

	static external: External = {
		key: 'HTMLPick',
		name: 'HTMLPick',
		type: 'controls',
		description: 'Listens for a picking event and performs a transition. Can only be used on HTML entities.',
		canTransition: true,
		parameters: [], // but not farther than some value
		transitions: [{
			key: 'pick',
			description: 'State to transition to when the HTML entity is picked.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (/*transitionKey, actionConfig*/){
		return 'On HTML Pick';
	};

	enter (fsm) {
		var ownerEntity = fsm.getOwnerEntity();
		if (ownerEntity.htmlComponent) {
			this.eventListener = function () {
				fsm.send(this.transitions.pick);
			}.bind(this);
			this.domElement = ownerEntity.htmlComponent.domElement;
			this.domElement.addEventListener('click', this.eventListener);
		}
	};

	exit (fsm) {
		var ownerEntity = fsm.getOwnerEntity();
		if (ownerEntity.htmlComponent && this.domElement) {
			this.domElement.removeEventListener('click', this.eventListener);
		}
	};
}

export = HtmlAction;