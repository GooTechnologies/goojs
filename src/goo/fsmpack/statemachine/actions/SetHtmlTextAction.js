define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function SetHtmlTextAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetHtmlTextAction.prototype = Object.create(Action.prototype);
	SetHtmlTextAction.prototype.constructor = SetHtmlTextAction;

	SetHtmlTextAction.external = {
		name: 'Set Html Text',
		type: 'fx',
		description: 'Sets the text of an html component',
		parameters: [{
			name: 'Entity (optional)',
			key: 'entity',
			type: 'entity',
			description: 'Entity that has an html component'
		}, {
			name: 'Html element selector',
			key: 'selector',
			type: 'string',
			description: 'Element id to set text on',
			'default': 'p'
		}, {
			name: 'Text',
			key: 'text',
			type: 'string',
			description: 'Text to set',
			'default': 'Hello'
		}],
		transitions: []
	};

	SetHtmlTextAction.prototype.update = function (fsm) {
		var entity = (this.entity && fsm.getEntityById(this.entity.entityRef)) || fsm.getOwnerEntity();
		if (entity && entity.htmlComponent && this.selector.length > 0) {
			var element = entity.htmlComponent.domElement.querySelector(this.selector);
			if (element) {
				element.innerHTML = this.text;
			}
		}
	};

	return SetHtmlTextAction;
});