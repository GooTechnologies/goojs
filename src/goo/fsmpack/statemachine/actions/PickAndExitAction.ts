import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class PickAndExitAction extends Action {
	url: string;
	exitName: string;
	eventListener: () => void;
	ownerEntity: any;
	goo: any;
	canvasElement: any;
	domElement: any;
	constructor(id: string, options: any){
		super(id, options);

		this.eventListener = function (event) {
			// To prevent touch + click event firing multiple times on touch devices
			event.stopPropagation();
			event.preventDefault();

			var htmlCmp = this.ownerEntity.getComponent('HtmlComponent');
			var clickedHtmlCmp = (htmlCmp && htmlCmp.domElement.contains(event.target));
			if (clickedHtmlCmp) {
				this.handleExit();
				return;
			}

			if (event.target !== this.canvasElement) {
				return;
			}

			var x, y;
			if (event.touches && event.touches.length) {
				x = event.touches[0].clientX;
				y = event.touches[0].clientY;
			} else if (event.changedTouches && event.changedTouches.length) {
				x = event.changedTouches[0].pageX;
				y = event.changedTouches[0].pageY;
			} else {
				x = event.offsetX;
				y = event.offsetY;
			}

			var pickResult = this.goo.pickSync(x, y);
			if (pickResult.id === -1) {
				return;
			}

			var entity = this.goo.world.entityManager.getEntityByIndex(pickResult.id);
			var descendants = [];
			this.ownerEntity.traverse(descendants.push.bind(descendants));
			if (descendants.indexOf(entity) === -1) {
				return;
			}

			this.handleExit();
		}.bind(this);
	}


	static external: External = {
		key: 'Pick and Exit',
		name: 'Pick and Exit',
		type: 'controls',
		description: 'Listens for a picking event on the entity and opens a new browser window.',
		canTransition: true,
		parameters: [{
			name: 'URL',
			key: 'url',
			type: 'string',
			description: 'URL to open.',
			'default': 'http://www.goocreate.com/'
		}, {
			name: 'Exit name',
			key: 'exitName',
			type: 'string',
			description: 'Name of the exit, used to track this exit in Ads.',
			'default': 'clickEntityExit'
		}],
		transitions: []
	};

	enter (fsm) {
		this.ownerEntity = fsm.getOwnerEntity();
		this.goo = this.ownerEntity._world.gooRunner;
		this.canvasElement = this.goo.renderer.domElement;
		//
		// ASSUMPTION: HtmlComponents will be attached in the DOM as siblings
		// to the canvas.
		//
		this.domElement = this.canvasElement.parentNode;
		this.domElement.addEventListener('click', this.eventListener, false);
		this.domElement.addEventListener('touchend', this.eventListener, false); // window.open does not work in touchstart for iOS9
	};

	handleExit () {
		var handler = (<any>window).gooHandleExit || function (url) {
			window.open(url, '_blank');
		};

		handler(this.url, this.exitName);
	};

	exit () {
		if (this.domElement) {
			this.domElement.removeEventListener('click', this.eventListener);
			this.domElement.removeEventListener('touchend', this.eventListener);
		}
	};
}

export = PickAndExitAction;
