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
	function CSS3DComponent(domElement, settings) {
		Component.apply(this, arguments);

		this.type = 'CSS3DComponent';

		/**
		 * DOM element.
		 */
		this.domElement = document.createElement('div');
		this.domElement.appendChild(domElement);
		domElement.style.position = 'absolute';
		domElement.style.top = '0px';
		domElement.style.bottom = '0px';
		domElement.style.left = '0px';
		domElement.style.right = '0px';

		settings = settings || {};

		/** 
		 * @type {number}
		 * @default 1
		 */
		this.scale = settings.scale || 0.01;

		this.width = settings.width || 1;
		this.height = settings.height || 1;

		// this.useTransformComponent = settings.useTransformComponent !== undefined ? settings.useTransformComponent : true;

		this.backfaceVisibility = settings.backfaceVisibility || 'hidden'; //'visible'

		/**
		 * @type {boolean}
		 */
		this.faceCamera = settings.faceCamera === undefined ? false : settings.faceCamera;

		this.updated = true;

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	CSS3DComponent.type = 'CSS3DComponent';

	CSS3DComponent.prototype = Object.create(Component.prototype);
	CSS3DComponent.prototype.constructor = CSS3DComponent;

	CSS3DComponent.prototype.setSize = function (width, height) {
		this.width = width || this.width;
		this.height = height || this.height;
		this.domElement.style.width = (this.width / this.scale) + 'px';
		this.domElement.style.height = (this.height / this.scale)+ 'px';
		this.updated = true;
	};

	return CSS3DComponent;
});
