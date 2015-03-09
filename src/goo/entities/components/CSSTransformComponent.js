define([
	'goo/entities/components/Component'
],  function (
	Component
) {
	'use strict';

	/**
	 * Connects a domElement to an entity and applies the transformComponent of the entity to the domElement with CSS3 3D transforms.
	 * @param {domElement} domElement
	 * @param {Object} settings
	 * @extends Component
	 */
	function CSSTransformComponent(domElement, settings) {
		Component.apply(this, arguments);

		this.type = 'CSSTransformComponent';

		/**
		 * DOM element.
		 */
		this.domElement = domElement;

		settings = settings || {};

		/** 
		 * @type {number}
		 * @default 1
		 */
		this.scale = settings.scale || 1;

		this.backfaceVisibility = settings.backfaceVisibility || 'hidden'; //'visible'

		/**
		 * @type {boolean}
		 */
		this.faceCamera = settings.faceCamera === undefined ? false : settings.faceCamera;

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	CSSTransformComponent.type = 'CSSTransformComponent';

	CSSTransformComponent.prototype = Object.create(Component.prototype);
	CSSTransformComponent.prototype.constructor = CSSTransformComponent;

	return CSSTransformComponent;
});
