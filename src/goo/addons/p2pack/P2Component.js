define([
	'goo/entities/components/Component'
],
/** @lends */
function (
	Component
) {
	'use strict';

	/**
	 * @class P2 physics component.
	 * P2 supports convex and primitive shapes.
	 * See also {@link P2System}
	 * @extends Component
	 * @param {Object}  [settings]                  The settings object can contain the following properties:
	 * @param {number}  [settings.mass=0]           Mass of the body. 0 means immovable.
	 * @param {number}  [settings.linearDamping=0]  Movement damping.
	 * @param {number}  [settings.angularDamping=0] Rotational damping.
	 * @param {array}   [settings.shapes=[]]        Collision shapes.
	 * @param {number}  [settings.scale=1]          Scale to apply from physics to rendering.
	 * @param {number}  [settings.offsetX=0]        Offset from physics to rendering.
	 * @param {number}  [settings.offsetY=0]
	 * @param {number}  [settings.offsetZ=0]
	 * @param {number}  [settings.offsetAngleX=0]   Angular offset from physics to rendering.
	 * @param {number}  [settings.offsetAngleY=0]
	 * @param {number}  [settings.offsetAngleZ=0]
	 * @example
	 * <caption>{@linkplain http://code.gooengine.com/latest/visual-test/goo/addons/p2/p2-vtest.html Working example}</caption>
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
		this.type = 'P2Component';
		this.settings = settings || {};
		this.mass =             settings.mass           !== undefined ? settings.mass            : 0;
		this.linearDamping =    settings.linearDamping  !== undefined ? settings.linearDamping   : 0;
		this.angularDamping =   settings.angularDamping !== undefined ? settings.angularDamping  : 0;
		this.shapes =           settings.shapes         !== undefined ? settings.shapes          : [];
		this.scale =            settings.scale          !== undefined ? settings.scale           : 1;
		this.offsetX =          settings.offsetX        !== undefined ? settings.offsetX         : 0;
		this.offsetY =          settings.offsetY        !== undefined ? settings.offsetY         : 0;
		this.offsetZ =          settings.offsetZ        !== undefined ? settings.offsetZ         : 0;
		this.offsetAngleX =     settings.offsetAngleX   !== undefined ? settings.offsetAngleX    : 0;
		this.offsetAngleY =     settings.offsetAngleY   !== undefined ? settings.offsetAngleY    : 0;
		this.offsetAngleZ =     settings.offsetAngleZ   !== undefined ? settings.offsetAngleZ    : 0;
	}

	P2Component.prototype = Object.create(Component.prototype);
	P2Component.prototype.constructor = P2Component;

	return P2Component;
});
