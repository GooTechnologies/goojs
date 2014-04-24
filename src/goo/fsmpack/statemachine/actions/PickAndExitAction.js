define([
	'goo/fsmpack/statemachine/actions/Action'
],
/** @lends */
function (
	Action
) {
	"use strict";

	function PickAndExitAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.eventListener = function (evt) {

			var pickResult = this.goo.pickSync(evt.offsetX, evt.offsetY);
			if (pickResult.id === -1) {
				return;
			}

			var entity = this.goo.world.entityManager.getEntityByIndex(pickResult.id);
			var descendants = [];
			this.ownerEntity.traverse(descendants.push.bind(descendants));
			if (descendants.indexOf(entity) === -1) {
				return;
			}

			var handler = window.gooHandleExit || this.handleExit.bind(this);
			handler(this.url, this.exitName);

		}.bind(this);
	}

	PickAndExitAction.prototype = Object.create(Action.prototype);

	PickAndExitAction.prototype.constructor = PickAndExitAction;

	PickAndExitAction.external = {
		name: 'Pick and Exit',
		type: 'controls',
		description: 'Listens for a picking event and opens a new browser window',
		canTransition: true,
		parameters: [{
			name: 'URL',
			key: 'url',
			type: 'string',
			description: 'URL to open',
			'default': 'http://www.gootechnologies.com'
		}, {
			name: 'Exit name',
			key: 'exitName',
			type: 'string',
			description: 'Name of the exit, used to track this exit in Ads.',
			'default': 'clickEntityExit'
		}],
		transitions: []
	};

	PickAndExitAction.prototype._setup = function (fsm) {
		this.ownerEntity = fsm.getOwnerEntity();
		this.goo = this.ownerEntity._world.gooRunner;
		this.domElement = this.goo.renderer.domElement;
		this.domElement.addEventListener('click', this.eventListener, false);
	};

	PickAndExitAction.prototype._run = function (fsm) {
		// Don't really need it.
	};

	PickAndExitAction.prototype.handleExit = function (url) {
		window.open(url, '_blank');
	};

	PickAndExitAction.prototype.exit = function () {
		if (this.domElement) {
			this.domElement.removeEventListener('click', this.eventListener);
		}
	};

	return PickAndExitAction;
});
