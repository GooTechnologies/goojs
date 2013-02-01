define([
	"goo/entities/components/Component"
], /** @lends CSSTransformComponent */ function (
	Component
) {
	"use strict";

	function CSSTransformComponent(domElement) {
		Component.call(this);

		this.type = "CSSTransformComponent";
		this.domElement = domElement;
	}

	CSSTransformComponent.prototype = Object.create(Component.prototype);

	return CSSTransformComponent;
});
