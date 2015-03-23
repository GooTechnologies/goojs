define([
	'goo/entities/components/Component'
], function (
	Component
) {
	'use strict';

	/**
	 * Box2DComponent
	 * @extends Component
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/components/Box2DComponent/Box2DComponent-vtest.html Working example
	 */
	function Box2DComponent(settings) {
		Component.apply(this, arguments);

		this.type = 'Box2DComponent';

		this.body = null;
		this.world = null;
		this.mass = 1;

		this.settings = settings || {};

		this.shape = settings.shape ? settings.shape : 'box';
		this.width = settings.width ? settings.width : 1;
		this.height = settings.height ? settings.height : 1;
		this.radius = settings.radius ? settings.radius : 1;
		this.vertices = settings.vertices ? settings.vertices : [0, 1, 2, 2, 0, 2];
		this.movable = settings.movable !== false;
		this.friction = settings.friction ? settings.friction : 1;
		this.restitution = settings.restitution ? settings.restitution : 0;
		this.offsetX = settings.offsetX ? settings.offsetX : 0;
		this.offsetY = settings.offsetY ? settings.offsetY : 0;
	}

	Box2DComponent.prototype = Object.create(Component.prototype);
	Box2DComponent.prototype.constructor = Box2DComponent;

	return Box2DComponent;
});