define([
	'goo/statemachine/actions/Actions',
	'goo/statemachine/StateUtils'
],
	/** @lends */
		function(
		Actions,
		StateUtils
		) {
		"use strict";

		/**
		 * @class
		 * @property {ArrayBuffer} data Data to wrap
		 */
		function GetPositionAction(settings) {
			settings = settings || {};

			this.entity = settings.entity || null;
			this.position = settings.position || [0, 0, 0];
			this.speed = settings.speed || 1;

			this.external = [
				{
					name: 'Entity',
					key: 'entity',
					type: 'entity'
				},
				{
					name: 'Position',
					key: 'position',
					type: 'vec3'
				},
				{
					name: 'Speed',
					key: 'speed',
					type: 'float',
					control: 'slider',
					min: 0,
					max: 10
				}];
		}

		GetPositionAction.prototype = {
			onEnter: function(/*fsm*/) {

			},
			onUpdate: function(fsm) {
				var translation = this.entity.transformComponent.transform.translation;
				if (this.entity !== null) {
					if (this.position[0]) {
						fsm.applyOnVariable(this.position[0], function() { return translation.data[0]; });
					}
					if (this.position[1]) {
						fsm.applyOnVariable(this.position[1], function() { return translation.data[1]; });
					}
					if (this.position[2]) {
						fsm.applyOnVariable(this.position[2], function() { return translation.data[2]; });
					}
				}
			},
			onExit: function(/*fsm*/) {

			}
		};

		Actions.register('GetPositionAction', GetPositionAction);

		return GetPositionAction;
	});