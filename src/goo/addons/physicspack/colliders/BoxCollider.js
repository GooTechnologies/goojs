import Vector3 from '../../../math/Vector3';
import Collider from '../../../addons/physicspack/colliders/Collider';



	/**
	 * Physics box collider.
	 * @param {Object} [settings]
	 * @param {Vector3} [settings.halfExtents] The half-extents of the box collider.
	 * @extends Collider
	 */
	function BoxCollider(settings) {
		settings = settings || {};

		/**
		 * @type {Vector3}
		 */
		this.halfExtents = settings.halfExtents ? new Vector3(settings.halfExtents) : new Vector3(0.5, 0.5, 0.5);

		Collider.call(this);
	}
	BoxCollider.prototype = Object.create(Collider.prototype);
	BoxCollider.prototype.constructor = BoxCollider;

	/**
	 * @private
	 * @param {Transform} transform
	 * @param {Collider} targetCollider
	 */
	BoxCollider.prototype.transform = function (transform, targetCollider) {
		targetCollider.halfExtents.set(transform.scale).mul(this.halfExtents);
	};

	/**
	 * Clone the collider
	 * @returns {BoxCollider}
	 */
	BoxCollider.prototype.clone = function () {
		return new BoxCollider({
			halfExtents: this.halfExtents
		});
	};

	export default BoxCollider;
