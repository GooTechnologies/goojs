define([
	'goo/statemachine/actions/Actions'
],
/** @lends */
function(
Actions
) {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function SetAnimationAction(settings) {
		this.type = 'SetAnimationAction';

		settings = settings || {};

		this.entity = settings.entity || null;
		this.animation = settings.animation || null;

		this.external = [
		{
			name: 'Entity',
			key: 'entity',
			type: 'entity'
		},
		{
			name:'Animation',
			key:'animation',
			type:'string'
		}];
	}

	SetAnimationAction.prototype = {
		update: function(fsm) {
			if (this.entity !== null && this.animation !== null && this.entity.animationComponent) {
				this.entity.animationComponent.animationManager.getBaseAnimationLayer().doTransition(this.animation);
			}
		}
	};

	Actions.register('SetAnimationAction', SetAnimationAction);
	return SetAnimationAction;
});