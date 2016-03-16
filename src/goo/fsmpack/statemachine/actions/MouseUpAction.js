import Action from '../../../fsmpack/statemachine/actions/Action';



	function MouseUpAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	MouseUpAction.prototype = Object.create(Action.prototype);
	MouseUpAction.prototype.constructor = MouseUpAction;

	MouseUpAction.external = {
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

	var labels = {
		mouseLeftUp: 'On left mouse up',
		middleMouseUp: 'On middle mouse up',
		rightMouseUp: 'On right mouse up',
		touchUp: 'On touch end'
	};

	MouseUpAction.getTransitionLabel = function(transitionKey/*, actionConfig*/){
		return labels[transitionKey];
	};

	MouseUpAction.prototype.enter = function (fsm) {
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

	MouseUpAction.prototype.exit = function () {
		document.removeEventListener('mouseup', this.mouseEventListener);
		document.removeEventListener('touchend', this.touchEventListener);
	};

	export default MouseUpAction;