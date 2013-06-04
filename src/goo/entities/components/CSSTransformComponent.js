define([
	"goo/entities/components/Component"
], /** @lends */ function (
	Component
) {
	"use strict";

	/**
	 * @class Connects a domElement to an entity and applies the transformComponent of the entity to the domElement with CSS3 3d transforms
	 * @param {domElement} domelement
	 */
	function CSSTransformComponent(domElement) {
		Component.call(this);

		this.type = "CSSTransformComponent";
		this.domElement = domElement;
		this.scale = 1;
	}

	CSSTransformComponent.prototype = Object.create(Component.prototype);

	return CSSTransformComponent;
});
