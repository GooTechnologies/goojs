define([
	'goo/entities/components/Component',
	'goo/math/Quaternion',
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/shapes/Quad',
	'goo/util/ObjectUtil'
],function(
	Component,
	Quaternion,
	Vector3,
	Transform,
	Box,
	Sphere,
	Quad,
	_
){
	"use strict";

	var CANNON = window.CANNON;

	/**
	 * @class Adds Cannon physics to an entity. Should be combined with one of the CannonCollider components, such as the @link{CannonSphereColliderComponent}. Also see {@link CannonSystem}.
	 * @extends Component
	 * @param {Object}  [settings]
	 * @param {number}  [settings.mass=1]
	 */
	function CannonRigidbodyComponent(settings){
		settings = settings || {};
		this.type = "CannonRigidbodyComponent";

		_.defaults(settings, {
			mass : 1,
			velocity : new Vector3()
			// Todo: a lot of more things from Cannon.js API
		});

		this.mass = settings.mass;

		this._initialized = false; // Keep track, so we can add the body next frame
		this._quat = new Quaternion();
		this._initialVelocity = new Vector3();
		this._initialVelocity.setv(settings.velocity);

		this.api = {

			setForce: function (force) {
				CannonRigidbodyComponent.prototype.setForce.call(this,force);
			}.bind(this),

			setVelocity: function (velocity) {
				CannonRigidbodyComponent.prototype.setVelocity.call(this,velocity);
			}.bind(this),

			// TODO: is it possible to use entity.setTranslation(), and override the TransformComponent API?
			setPosition: function (pos) {
				CannonRigidbodyComponent.prototype.setPosition.call(this,pos);
			}.bind(this),

			setAngularVelocity: function (angularVelocity) {
				CannonRigidbodyComponent.prototype.setAngularVelocity.call(this, angularVelocity);
			}.bind(this),
		};
	}

	CannonRigidbodyComponent.prototype = Object.create(Component.prototype);
	CannonRigidbodyComponent.constructor = CannonRigidbodyComponent;

	CannonRigidbodyComponent.prototype.setForce = function (force) {
		this.body.force.set(force.x, force.y, force.z);
	};

	CannonRigidbodyComponent.prototype.setVelocity = function (velocity) {
		this.body.velocity.set(velocity.x, velocity.y, velocity.z);
	};

	CannonRigidbodyComponent.prototype.setPosition = function (pos) {
		this.body.position.set(pos.x, pos.y, pos.z);
	};

	CannonRigidbodyComponent.prototype.setAngularVelocity = function (angularVelocity) {
		this.body.angularVelocity.set(angularVelocity.x, angularVelocity.y, angularVelocity.z);
	};

	/**
	 * Get the collider component from an entity, if one exist.
	 * @return {mixed} Any of the collider types, or NULL if not found
	 */
	CannonRigidbodyComponent.getCollider = function(entity){
		return entity.cannonBoxColliderComponent || entity.cannonPlaneColliderComponent || entity.cannonSphereColliderComponent || null;
	};

	CannonRigidbodyComponent.prototype.createShape = function(entity) {
		var shape;

		var collider = CannonRigidbodyComponent.getCollider(entity);
		if (!collider) {
			// No collider. Check children.
			shape = new CANNON.Compound();

			// Needed for getting the Rigidbody-local transform of each collider
			var bodyTransform = entity.transformComponent.worldTransform;
			var invBodyTransform = new Transform();
			invBodyTransform.copy(bodyTransform);
			invBodyTransform.invert(invBodyTransform);
			//var gooTrans = new Transform();

			var that = this;
			entity.traverse(function(entity){
				var collider = CannonRigidbodyComponent.getCollider(entity);
				if(collider){

					// TODO: Should look at the world transform and then get the transform relative to the root entity. This is needed for compounds with more than one level of recursion
					// Like this:
					//gooTrans.copy(entity.transformComponent.worldTransform);
					//Transform.combine(invBodyTransform, gooTrans, gooTrans);
					//var t = gooTrans;
					// But for now it does not work.. just do this instead:
					var t = entity.transformComponent.transform;

					var trans = t.translation;
					var rot = t.rotation;
					var offset = new CANNON.Vec3(trans.x, trans.y, trans.z);
					var q = that._quat;
					q.fromRotationMatrix(rot);
					var orientation = new CANNON.Quaternion(q.x, q.y, q.z, q.w);
					shape.addChild(collider.cannonShape, offset, orientation);
				}
			});

		} else {

			// Entity has a collider on the root
			// Create a simple shape
			shape = collider.cannonShape;
		}

		return shape;
	};

	return CannonRigidbodyComponent;
});
