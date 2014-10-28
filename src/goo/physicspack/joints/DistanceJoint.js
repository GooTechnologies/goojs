define([
	'goo/entities/components/Component',
	'goo/util/ObjectUtil',
	'goo/physicspack/joints/Joint'
],
/** @lends */
function (
	Component,
	_,
	Joint
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
	function BallJoint(settings) {
		settings = settings || {};

		_.defaults(settings, {
			distance : 1,
			connectedBody: null
		});

		this.distance = settings.distance;
		this.connectedBody = settings.connectedBody;

		this.cannonConstraint = null;
	}
	BallJoint.prototype = Object.create(Joint.prototype);
	BallJoint.constructor = BallJoint;

	BallJoint.prototype.createConstraint = function (entity) {
		var bodyA = entity.cannonRigidbodyComponent.body;
		var bodyB = this.connectedBody.body;
		this.cannonConstraint = new CANNON.DistanceConstraint(bodyA, bodyB, this.distance);
		return this.cannonConstraint;
	};

	return BallJoint;
});
