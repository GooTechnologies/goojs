define([
	'goo/entities/components/Component'
],
/** @lends */
function(
	Component
) {
	'use strict';

	function Box2DComponent(settings) {
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
		this.movable = settings.movable === false ? false : true;
		this.friction = settings.friction ? settings.friction : 1;
		this.restitution = settings.restitution ? settings.restitution : 0;
		this.offsetX = settings.offsetX ? settings.offsetX : 0;
		this.offsetY = settings.offsetY ? settings.offsetY : 0;
	}

	Box2DComponent.prototype = Object.create(Component.prototype);

	return Box2DComponent;
});