define(['goo/statemachine/actions/Action'],
/** @lends */
function(Action) {
	"use strict";

	function SetRotationAction(settings) {
		settings = settings || {};
		this.everyFrame = settings.everyFrame || true;

		this.entity = settings.entity || null;
		this.rotation = settings.rotation || [0, 0, 0];
	}

	SetRotationAction.prototype = Object.create(Action.prototype);

	SetRotationAction.external = [
		{
			name: 'Entity',
			key: 'entity',
			type: 'entity'
		},
		{
			name:'Rotation',
			key:'rotation',
			type:'vec3'
		}];

	// not on create
	SetRotationAction.prototype.onCreate = function(/*fsm*/) {
		if (this.entity !== null) {
			this.entity.transformComponent.transform.setRotationXYZ(this.rotation[0], this.rotation[1], this.rotation[2]);
			this.entity.transformComponent.setUpdated();
		}
	};

	return SetRotationAction;
});