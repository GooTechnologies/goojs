define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/fsmpack/statemachine/FSMUtils'
], function (
	Action,
	FSMUtils
) {
	'use strict';

	function SetPositionAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetPositionAction.prototype = Object.create(Action.prototype);

	SetPositionAction.prototype.configure = function(settings) {
		this.everyFrame = !!settings.everyFrame;
		this.entity = settings.entity || null;
		this.amountX = settings.amountX || 0;
		this.amountY = settings.amountY || 0;
		this.amountZ = settings.amountZ || 0;
	};

	SetPositionAction.external = {
		parameters: [{
			name: 'Entity',
			key: 'entity',
			type: 'entity',
			description: 'Entity to move'
		}, {
			name: 'Amount X',
			key: 'amountX',
			type: 'float',
			description: 'Position on the X axis',
			'default': 0
		}, {
			name: 'Amount Y',
			key: 'amountY',
			type: 'float',
			description: 'Position on the Y axis',
			'default': 0
		}, {
			name: 'Amount Z',
			key: 'amountZ',
			type: 'float',
			description: 'Position on the Z axis',
			'default': 0
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: []
	};

	SetPositionAction.prototype._run = function(fsm) {
		if (this.entity !== null) {
			this.entity.transformComponent.transform.translation.setDirect(
				FSMUtils.getValue(this.amountX, fsm),
				FSMUtils.getValue(this.amountY, fsm),
				FSMUtils.getValue(this.amountZ, fsm)
			);
			this.entity.transformComponent.setUpdated();

			/*
			// Hack for box2d physics, tmp
			if (this.entity.body) {
				var translation = this.entity.transformComponent.transform.translation;
				this.entity.body.SetTransform(new window.Box2D.b2Vec2(translation.x, translation.y), this.entity.body.GetAngle());
			}
			*/
		}
	};

	return SetPositionAction;
});