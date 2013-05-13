define([
	"goo/entities/components/Component"
], /** @lends */ function (
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
