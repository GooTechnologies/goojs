var Component = require('../../entities/components/Component');
var ObjectUtil = require('../../util/ObjectUtil');

	'use strict';

	/**
	 * P2 physics component.
	 * P2 supports convex and primitive shapes.
	 * See also {@link P2System}
	 * @extends Component
	 * @param {Object}  [options]                  The options object can contain the following properties:
	 * @param {number}  [options.mass=0]           Mass of the body. 0 means immovable.
	 * @param {number}  [options.linearDamping=0]  Movement damping.
	 * @param {number}  [options.angularDamping=0] Rotational damping.
	 * @param {Array}   [options.shapes=[]]        Collision shapes.
	 * @param {number}  [options.scale=1]          Scale to apply from physics to rendering.
	 * @param {number}  [options.offsetX=0]        Offset from physics to rendering.
	 * @param {number}  [options.offsetY=0]
	 * @param {number}  [options.offsetZ=0]
	 * @param {number}  [options.offsetAngleX=0]   Angular offset from physics to rendering.
	 * @param {number}  [options.offsetAngleY=0]
	 * @param {number}  [options.offsetAngleZ=0]
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
	function P2Component(options) {
		Component.apply(this, arguments);

		this.type = 'P2Component';

		ObjectUtil.copyOptions(this, options, {
			mass: 0,
			linearDamping: 0,
			angularDamping: 0,
			shapes: [],
			scale: 1,
			offsetX: 0,
			offsetY: 0,
			offsetZ: 0,
			offsetAngleX: 0,
			offsetAngleY: 0,
			offsetAngleZ: 0
		});
	}

	P2Component.prototype = Object.create(Component.prototype);
	P2Component.prototype.constructor = P2Component;

	module.exports = P2Component;
