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
	function SetLightRangeAction(settings) {
		settings = settings || {};

		this.entity = settings.entity || null;
		this.range = settings.range || 100;

		this.external = [
		{
			name: 'Entity',
			key: 'entity',
			type: 'entity'
		},
		{
			name: 'Range',
			key: 'range',
			type: 'float',
			control: 'slider',
			min: 0,
			max: 1000
		}];
	}

	SetLightRangeAction.prototype = {
		onEnter: function(/*fsm*/) {
			if (this.entity &&
				this.entity.lightComponent &&
				this.entity.lightComponent.light) {
				this.entity.lightComponent.light.range = this.range;
			}
		},
		onUpdate: function(/*fsm*/) {

		},
		onExit: function(/*fsm*/) {

		}
	};

	Actions.register('ChangeLightRangeAction', SetLightRangeAction);
	return SetLightRangeAction;
});