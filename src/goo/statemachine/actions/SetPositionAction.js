define([],
/** @lends */
function() {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function SetPositionAction(settings) {
		settings = settings || {};

		this.entity = settings.entity || null;
		this.position = settings.position || [0, 0, 0];

		this.external = [
		{
			name: 'Entity',
			key: 'entity',
			type: 'entity'
		},
		{
			name:'Position',
			key:'position',
			type:'vec3'
		}];
	}

	SetPositionAction.prototype = {
		onCreate: function(/*fsm*/) {
			if (this.entity !== null) {
				this.entity.transformComponent.transform.translation.seta(this.position);
				this.entity.transformComponent.setUpdated();

				// Hack for box2d physics, tmp
				if (this.entity.body) {
					var translation = this.entity.transformComponent.transform.translation;
					this.entity.body.SetTransform(new window.Box2D.b2Vec2(translation.x, translation.y), this.entity.body.GetAngle());
				}
			}
		}
	};

	return SetPositionAction;
});