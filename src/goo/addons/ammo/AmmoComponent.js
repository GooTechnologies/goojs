define([
	'goo/entities/components/Component', 'goo/math/Quaternion'

],
/** @lends */
function(
	Component, Quaternion
) {
	"use strict";

	/**
	 * @class Adds Ammo physics to a Goo entity.
	 * Ammo is a powerful physics engine converted from the c language project Bullet
	 * use Ammo.js if you need to support any 3D shape ( trimesh )
	 * See also {@link AmmoSystem}
	 * @extends Component
	 * @param {Object} [settings] The settings object can contain the following properties:
	 * @param {number} [settings.mass=0] (0 means immovable)
	 * @param {boolean} [settings.useBounds=false] use the model bounds or use the real (must-be-convex) vertices
	 * @example
	 * var entity = EntityUtils.createTypicalEntity(goo.world, ShapeCreator.createBox(20, 10, 1));
	 * entity.setComponent(new AmmoComponent({mass:5}));
	 */
	function AmmoComponent(settings) {
		this.type = 'AmmoComponent';
		this.settings = settings || {};
		this.mass = settings.mass !== undefined ? settings.mass : 0;
		this.useBounds = settings.useBounds !== undefined ? settings.useBounds : false;
		this.linearDamping = settings.linearDamping !== undefined ? settings.linearDamping : 0;
		this.angularDamping = settings.angularDamping !== undefined ? settings.angularDamping : 0;
		
		this.ammoTransform = new Ammo.btTransform();
		this.quaternion = new Quaternion();
	}
	AmmoComponent.prototype = Object.create(Component.prototype);

	AmmoComponent.prototype.process = function(entity, tpf) {
		var tc = entity.transformComponent;
		entity.ammoComponent.body.getMotionState().getWorldTransform(this.ammoTransform);
		var ammoQuat = this.ammoTransform.getRotation();
		this.quaternion.setd(ammoQuat.x(), ammoQuat.y(), ammoQuat.z(), ammoQuat.w());
		tc.transform.rotation.copyQuaternion(this.quaternion);
		var origin = this.ammoTransform.getOrigin();
		tc.setTranslation(origin.x(), origin.y(), origin.z());
	}


	return AmmoComponent;
});
