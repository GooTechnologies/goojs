define([
	"goo/entities/components/Component"
], /** @lends */ function (
	Component
) {
	'use strict';

	/**
	 * @class Connects a domElement to an entity and applies the transformComponent of the entity to the domElement with CSS3 3D transforms.
	 * @param {domElement} domelement
	 * @param {boolean} faceCamera
	 * @extends Component
	 */
	function CSSTransformComponent(domElement, faceCamera) {
		Component.call(this);

		this.type = "CSSTransformComponent";

		/**
		 * DOM element.
		 */
		this.domElement = domElement;

		/** 
		 * @type {number}
		 * @default 1
		 */
		this.scale = 1;

		/**
		 * @type {boolean}
		 */
		this.faceCamera = (typeof faceCamera === 'undefined') ? false : faceCamera;
	}

	CSSTransformComponent.prototype = Object.create(Component.prototype);

	return CSSTransformComponent;
});
