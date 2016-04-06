var Component = require('../../../entities/components/Component');
var ObjectUtil = require('../../../util/ObjectUtil');

/**
 * Box2DComponent
 * @extends Component
 * @example-link http://code.gooengine.com/latest/visual-test/goo/components/Box2DComponent/Box2DComponent-vtest.html Working example
 */
function Box2DComponent(options) {
	Component.apply(this, arguments);

	this.type = 'Box2DComponent';

	this.body = null;
	this.world = null;
	this.mass = 1;

	ObjectUtil.copyOptions(this, options, {
		shape: 'box',
		width: 1,
		height: 1,
		radius: 1,
		vertices: [0, 1, 2, 2, 0, 2],
		movable: true,
		friction: 1,
		restitution: 0,
		offsetX: 0,
		offsetY: 0
	});
}

Box2DComponent.prototype = Object.create(Component.prototype);
Box2DComponent.prototype.constructor = Box2DComponent;

module.exports = Box2DComponent;