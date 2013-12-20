define([
	'goo/entities/components/Component'
],
/** @lends */
function(
	Component
) {
	"use strict";

	/**
	 * @class Adds cannon physics to a Goo entity.
	 * Cannon is somewhat limited and only supports convex and primitive shapes ( ConvexPolyhedron )
	 * use Ammo.js if you need to support any 3D shape ( trimesh )
	 * See also {@link CannonSystem}
	 * @extends Component
	 * @param {Object} [settings] The settings object can contain the following properties:
	 * @param {number} [settings.mass=0] (0 means immovable)
	 * @param {boolean} [settings.useBounds=false] use the model bounds or use the real (must-be-convex) vertices
	 * @param {number} [settings.linearDamping=0] (not supported at the moment)
	 * @param {number} [settings.angularDamping=0] (not supported at the moment)
	 * @example
	 * var entity = EntityUtils.createTypicalEntity(goo.world, ShapeCreator.createBox(20, 10, 1));
	 * entity.setComponent(new CannonComponent(settings));test
	 */
	function CannonComponent(settings) {
		this.type = 'CannonComponent';
		this.settings = settings || {};
		this.mass = settings.mass !== undefined ? settings.mass : 0;
		this.useBounds = settings.useBounds !== undefined ? settings.useBounds : false;
		this.linearDamping = settings.linearDamping !== undefined ? settings.linearDamping : 0;
		this.angularDamping = settings.angularDamping !== undefined ? settings.angularDamping : 0;
	}
	CannonComponent.prototype = Object.create(Component.prototype);

	return CannonComponent;
});
