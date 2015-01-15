define([
	'goo/entities/components/Component',
	'goo/util/ObjectUtil'
],
/** @lends */
function (
	Component,
	_
) {
	'use strict';

	/* global CANNON */

	/**
	 * @class Distance joint. Add to an entity with a {@link CannonRigidbodyComponent} and physically link it to another entity!<br>
	 * {@linkplain http://code.gooengine.com/latest/visual-test/goo/addons/Cannon/Cannon-vtest.html Working example}
	 * @extends Component
	 * @param {object} [settings]
	 * @param {number} [settings.distance=1]
	 * @param {CannonRigidbodyComponent} settings.connectedBody
	 */
	function CannonDistanceJointComponent(settings) {
		Component.apply(this, arguments);

		settings = settings || {};
		this.type = 'CannonDistanceJointComponent';

		_.defaults(settings, {
			distance : 1,
			connectedBody: null
		});

		this.distance = settings.distance;
		this.connectedBody = settings.connectedBody;

		this.cannonConstraint = null;
	}
	CannonDistanceJointComponent.prototype = Object.create(Component.prototype);
	CannonDistanceJointComponent.constructor = CannonDistanceJointComponent;

	CannonDistanceJointComponent.prototype.createConstraint = function (entity) {
		var bodyA = entity.cannonRigidbodyComponent.body;
		var bodyB = this.connectedBody.body;
		this.cannonConstraint = new CANNON.DistanceConstraint(bodyA, bodyB, this.distance);
		return this.cannonConstraint;
	};

	return CannonDistanceJointComponent;
});
