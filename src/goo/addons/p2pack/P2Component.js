define([
	'goo/entities/components/Component',
	'goo/util/ObjectUtil'
], function (
	Component,
	ObjectUtil
) {
	'use strict';

	/**
	 * P2 physics component.
	 * P2 supports convex and primitive shapes.
	 * See also {@link P2System}
	 * @extends Component
	 * @param {Object}  [settings]                  The settings object can contain the following properties:
	 * @param {number}  [settings.mass=0]           Mass of the body. 0 means immovable.
	 * @param {number}  [settings.linearDamping=0]  Movement damping.
	 * @param {number}  [settings.angularDamping=0] Rotational damping.
	 * @param {Array}   [settings.shapes=[]]        Collision shapes.
	 * @param {number}  [settings.scale=1]          Scale to apply from physics to rendering.
	 * @param {number}  [settings.offsetX=0]        Offset from physics to rendering.
	 * @param {number}  [settings.offsetY=0]
	 * @param {number}  [settings.offsetZ=0]
	 * @param {number}  [settings.offsetAngleX=0]   Angular offset from physics to rendering.
	 * @param {number}  [settings.offsetAngleY=0]
	 * @param {number}  [settings.offsetAngleZ=0]
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/addons/p2/p2-vtest.html Working example
	 * @example
	 * var entity = goo.world.createEntity(new Box());
	 * var p2comp = new P2Component({
	 *     shapes:[{
	 *         type: 'circle',
	 *         radius: 1
	 *     }],
	 * });
	 * entity.setComponent(p2comp);
	 */
	function P2Component(settings) {
		Component.apply(this, arguments);

		this.type = 'P2Component';

		this.mass = 0;
		this.linearDamping = 0;
		this.angularDamping = 0;
		this.shapes = [];
		this.scale = 1;
		this.offsetX = 0;
		this.offsetY = 0;
		this.offsetZ = 0;
		this.offsetAngleX = 0;
		this.offsetAngleY = 0;
		this.offsetAngleZ = 0;

		if (settings) {
			ObjectUtil.defaults(this, settings);
		}
	}

	P2Component.prototype = Object.create(Component.prototype);
	P2Component.prototype.constructor = P2Component;

	return P2Component;
});
