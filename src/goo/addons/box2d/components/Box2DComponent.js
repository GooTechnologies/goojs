define([
	'goo/entities/components/Component'
],
/** @lends */
function(
	Component
) {
	"use strict";

	function Box2DComponent(settings) {
		Component.call(this, 'Box2DComponent', false);

		this.body = null;
		this.world = null;
		this.mass = 1;

		this.settings = settings || {};

		this.shape = settings.shape ? settings.shape : "box";
		this.width = settings.width ? settings.width : 1;
		this.height = settings.height ? settings.height : 1;
		this.radius = settings.radius ? settings.radius : 1;
		this.vertices = settings.vertices ? settings.vertices : [0,1,2,2,0,2];
		this.movable = settings.movable === true ? true : false;
		this.friction = settings.friction ? settings.friction : 1;
		this.offsetX = settings.offsetX ? settings.offsetX : 0;
		this.offsetY = settings.offsetY ? settings.offsetY : 0;
	}

	Box2DComponent.prototype = Object.create(Component.prototype);

	return Box2DComponent;
});