define([
	'goo/math/Vector3',
	'goo/statemachine/actions/Actions'
],
/** @lends */
function(
	Vector3,
	Actions
) {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function TestCollisionAction(settings) {
		this.type = 'TestCollisionAction';

		settings = settings || {};

		this.entity1 = settings.entity1 || null;
		this.entity2 = settings.entity2 || null;
		this.noCollisionEvent = settings.noCollisionEvent || 'noCollision';
		this.collisionEvent = settings.collisionEvent || 'collision';

		this.external = {
			entity1: ['entity', 'Entity 1'],
			entity2: ['entity', 'Entity 2'],
			noCollisionEvent: ['string', 'No collision event'],
			collisionEvent: ['string', 'Collision event']
		};
	}

	TestCollisionAction.prototype = {
		update: function(fsm, state, tpf) {
			if (this.entity1 !== null && this.entity2 !== null) {
				if (this.entity1.meshRendererComponent.worldBound.intersects(this.entity2.meshRendererComponent.worldBound)) {
					fsm.handle(this.collisionEvent);
				} else {
					fsm.handle(this.noCollisionEvent);
				}
			}
		}
	};

	Actions.register('TestCollisionAction', TestCollisionAction);
	return TestCollisionAction;
});