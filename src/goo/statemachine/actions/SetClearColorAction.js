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
	function SetClearColorAction(settings) {
		this.type = 'SetClearColorAction';

		settings = settings || {};

		this.color = settings.color || [0, 0, 0, 0];

		this.external = [
			{
				name:'Color',
				key:'color',
				type:'color'
			}
		];
	}

	SetClearColorAction.prototype = {
		create: function(fsm) {
			console.log("Setting clear color to " + JSON.stringify(this.color));
			fsm.getEngine().renderer.setClearColor(this.color[0], this.color[1], this.color[2], this.color[3]);
		}
	};

	Actions.register('SetClearColorAction', SetClearColorAction);
	return SetClearColorAction;
});