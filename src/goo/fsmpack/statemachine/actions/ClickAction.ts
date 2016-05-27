import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';

class ClickAction extends Action {
	x: number;
	y: number;
	selected: boolean;
	ownerEntity: any;
	gooRunner: any;
	upListener: (event: any) => void;
	downListener: (event: any) => void;
	constructor(id: string, options: any){
		super(id, options)
		this.selected = false;
		this.x = 0;
		this.y = 0;
	}

	static external: External = {
		key: 'Click/Tap',
		name: 'Click/Tap on entity',
		type: 'controls',
		description: 'Listens for a click/tap event on the entity and performs a transition.',
		canTransition: true,
		parameters: [], // but not farther than some value
		transitions: [{
			key: 'click',
			description: 'State to transition to when entity is clicked.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (/*transitionKey, actionConfig*/){
		return 'On Click/Tap Entity';
	};

	enter (fsm) {
		var that = this;
		this.downListener = function (event) {
			var x, y;
			var gooRunner = that.gooRunner;
			var domTarget = gooRunner.renderer.domElement;
			if (event.type === 'touchstart' || event.type === 'touchend') {
				x = event.changedTouches[0].pageX - domTarget.getBoundingClientRect().left;
				y = event.changedTouches[0].pageY - domTarget.getBoundingClientRect().top;
			} else {
				var rect = domTarget.getBoundingClientRect();
				x = event.clientX - rect.left;
				y = event.clientY - rect.top;
			}
			var pickingStore = gooRunner.pickSync(x, y);
			var pickedEntity = gooRunner.world.entityManager.getEntityByIndex(pickingStore.id);

			if (!pickedEntity) {
				return;
			}

			pickedEntity.traverseUp(function (entity) {
				if (entity === that.ownerEntity) {
					that.x = x;
					that.y = y;
					that.selected = true;
					return false;
				}
			});
		};
		this.upListener = function (event) {
			if (!that.selected) {
				return;
			}

			that.selected = false;

			var x, y;
			var gooRunner = that.gooRunner;
			var domTarget = gooRunner.renderer.domElement;
			var rect = domTarget.getBoundingClientRect();
			if (event.type === 'touchstart' || event.type === 'touchend') {
				x = event.changedTouches[0].pageX - rect.left;
				y = event.changedTouches[0].pageY - rect.top;
			} else {
				x = event.clientX - rect.left;
				y = event.clientY - rect.top;
			}

			var diffx = that.x - x;
			var diffy = that.y - y;
			if (Math.abs(diffx) > 10 || Math.abs(diffy) > 10) {
				return;
			}

			var pickingStore = gooRunner.pickSync(x, y);
			var pickedEntity = gooRunner.world.entityManager.getEntityByIndex(pickingStore.id);

			if (!pickedEntity) {
				return;
			}

			pickedEntity.traverseUp(function (entity) {
				if (entity === that.ownerEntity) {
					fsm.send(that.transitions.click);
					return false;
				}
			});
		};

		this.ownerEntity = fsm.getOwnerEntity();
		this.gooRunner = this.ownerEntity._world.gooRunner;

		document.addEventListener('mousedown', this.downListener);
		document.addEventListener('touchstart', this.downListener);
		document.addEventListener('mouseup', this.upListener);
		document.addEventListener('touchend', this.upListener);

		this.selected = false;
	};

	exit () {
		document.removeEventListener('mousedown', this.downListener);
		document.removeEventListener('touchstart', this.downListener);
		document.removeEventListener('mouseup', this.upListener);
		document.removeEventListener('touchend', this.upListener);
	};
}

export = ClickAction;
