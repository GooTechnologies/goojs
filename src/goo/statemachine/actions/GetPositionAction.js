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
			this.position = settings.position || [];
		}

		GetPositionAction.external = [
			{
				name: 'Entity',
				key: 'entity',
				type: 'entity'
			},
			{
				name: 'Position',
				key: 'position',
				type: 'vec3'
			}];

		GetPositionAction.prototype = {
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
		};

		Actions.register('GetPositionAction', GetPositionAction);
		return GetPositionAction;
	});