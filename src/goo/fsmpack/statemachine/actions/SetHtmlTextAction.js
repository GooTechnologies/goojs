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
		key: 'Set Html Text',
		name: 'Set Html Text',
		type: 'fx',
		description: 'Sets the contents of an HTML element.',
		parameters: [{
			name: 'Entity (optional)',
			key: 'entity',
			type: 'entity',
			description: 'Entity that has an HTML component.'
		}, {
			name: 'Html element selector',
			key: 'selector',
			type: 'string',
			description: 'Element selector to set text on.',
			'default': 'p'
		}, {
			name: 'Content',
			key: 'content',
			type: 'string',
			description: 'Content to set.',
			'default': 'Hello'
		}, {
			name: 'Allow HTML',
			key: 'html',
			type: 'boolean',
			description: 'Set to true if the content contains HTML. This will make the action use .innerHTML instead of .innerText.',
			'default': false
		}],
		transitions: []
	};

	SetHtmlTextAction.prototype.enter = function (fsm) {
		var entity = (this.entity && fsm.getEntityById(this.entity.entityRef)) || fsm.getOwnerEntity();
		if (entity && entity.htmlComponent && this.selector.length > 0) {
			var elements = entity.htmlComponent.domElement.querySelectorAll(this.selector);
			for(var i=0; i<elements.length; i++){
				var element = elements[i];
				if(this.html){
					element.innerHTML = this.content;
				} else {
					element.innerText = this.content;
				}
			}
		}
	};

	return SetHtmlTextAction;
});