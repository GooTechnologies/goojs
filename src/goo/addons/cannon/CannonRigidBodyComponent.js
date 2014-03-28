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

	/**
	 * @class Adds Cannon physics to an entity. Should be combined with one of the CannonCollider components, such as the @link{CannonSphereColliderComponent}. Also see {@link CannonSystem}.
	 * @extends Component
	 * @param {Object}  [settings]
	 * @param {number}  [settings.mass=1]
	 */
	function CannonRigidbodyComponent(settings){
		settings = settings || {};
		this.type = "CannonRigidbodyComponent";

		_.defaults(settings,{
			mass : 1
		});

		this.mass = settings.mass;

		this._initialized = false; // Keep track, so we can add the body next frame
	}

	CannonRigidbodyComponent.prototype = Object.create(Component.prototype);
	CannonRigidbodyComponent.constructor = CannonRigidbodyComponent;

	return CannonRigidbodyComponent;
});
