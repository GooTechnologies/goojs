import Action = require('./Action');
import {External, GetTransitionLabelFunc} from './IAction';
var BoundingPicker = require('./../../../renderer/bounds/BoundingPicker');

class HoverExitAction extends Action {
	first: boolean;
	hit: boolean;
	ownerEntity: any;
	moveListener: (event: any) => void;
	goo: any;
	type: string;
	constructor(id: string, options: any){
		super(id, options);
		this.first = true;
		this.hit = false;
	}

	static types = {
		fast: 'Bounding (Fast)',
		slow: 'Per pixel (Slow)'
	}

	static external: External = {
		key: 'Hover Exit',
		name: 'Entity Hover Exit',
		type: 'controls',
		description: 'Listens for a hover exit event on the entity and performs a transition.',
		canTransition: true,
		parameters: [{
			name: 'Accuracy',
			key: 'type',
			type: 'string',
			control: 'dropdown',
			description: 'Hover accuracy/performance selection.',
			'default': HoverExitAction.types.fast,
			options: [HoverExitAction.types.fast, HoverExitAction.types.slow]
		}],
		transitions: [{
			key: 'exit',
			description: 'State to transition to when entity is exited.'
		}]
	};

	static getTransitionLabel: GetTransitionLabelFunc = function (/*transitionKey, actionConfig*/){
		return 'On Entity Hover Exit';
	};

	enter (fsm) {
		var that = this;
		var isHit = function (entity) {
			if (!entity) {
				return false;
			}
			var hit = false;
			entity.traverseUp(function (entity) {
				if (entity === that.ownerEntity) {
					hit = true;
					return false;
				}
			});
			return hit;
		};

		var checkExit = function (entity) {
			var hit = isHit(entity);

			if ((that.first || that.hit) && !hit) {
				fsm.send(that.transitions.exit);
			}
			that.hit = hit;
			that.first = false;
		};

		this.moveListener = function (event) {
			var x, y;
			var domTarget = that.goo.renderer.domElement;
			if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
				x = event.changedTouches[0].pageX - domTarget.getBoundingClientRect().left;
				y = event.changedTouches[0].pageY - domTarget.getBoundingClientRect().top;
			} else {
				var rect = domTarget.getBoundingClientRect();
				x = event.clientX - rect.left;
				y = event.clientY - rect.top;
			}

			var camera = that.goo.renderSystem.camera;
			var pickedEntity = null;

			if (that.type === HoverExitAction.types.slow) {
				var pickingStore = that.goo.pickSync(x, y);
				pickedEntity = that.goo.world.entityManager.getEntityByIndex(pickingStore.id);
			} else {
				var pickList = BoundingPicker.pick(that.goo.world, camera, x, y);
				if (pickList.length > 0) {
					pickedEntity = pickList[0].entity;
				}
			}

			checkExit(pickedEntity);
		};

		this.ownerEntity = fsm.getOwnerEntity();
		this.goo = this.ownerEntity._world.gooRunner;

		document.addEventListener('mousemove', this.moveListener);
		document.addEventListener('touchmove', this.moveListener);

		this.first = true;
		this.hit = false;
	};

	exit () {
		document.removeEventListener('mousemove', this.moveListener);
		document.removeEventListener('touchmove', this.moveListener);
	};
}

export = HoverExitAction;