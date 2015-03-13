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
	function CSS3DComponent(settings) {
		Component.apply(this, arguments);

		this.type = 'CSS3DComponent';

		settings = settings || {};

		/** 
		 * @type {number}
		 * @default 1
		 */
		// this.scale = settings.scale || 1;

		this.width = settings.width || 100;
		this.height = settings.height || 100;

		// this.useTransformComponent = settings.useTransformComponent !== undefined ? settings.useTransformComponent : true;

		this.backfaceVisibility = settings.backfaceVisibility || 'hidden'; //'visible'

		/**
		 * @type {boolean}
		 */
		this.faceCamera = settings.faceCamera === undefined ? false : settings.faceCamera;

		this.updated = true;

		/**
		 * DOM element.
		 */
		if (settings.domElement) {
			this.initDom(settings.domElement);
		}

		// #ifdef DEBUG
		// Object.seal(this);
		// #endif
	}	

	CSS3DComponent.type = 'CSS3DComponent';

	CSS3DComponent.prototype = Object.create(Component.prototype);
	CSS3DComponent.prototype.constructor = CSS3DComponent;

	CSS3DComponent.prototype.initDom = function (domElement) {
		this.domElement = document.createElement('div');
		this.domElement.appendChild(domElement);
		this.domElement.style.position = 'absolute';
		this.domElement.style.margin = '0px';
		this.domElement.style.padding = '0px';
		this.domElement.style.backgroundColor = 'white';
		this.domElement.style.WebkitBackfaceVisibility = this.backfaceVisibility;
		this.domElement.style.backfaceVisibility = this.backfaceVisibility;
		domElement.style.position = 'absolute';
		domElement.style.top = '0px';
		domElement.style.bottom = '0px';
		domElement.style.left = '0px';
		domElement.style.right = '0px';
		this.setSize(this.width, this.height);
	};

	CSS3DComponent.prototype.setSize = function (width, height) {
		var xdiff = this.width / width;
		var ydiff = this.height / height;
		this.width = width || this.width;
		this.height = height || this.height;
		// this.domElement.style.width = (this.width / this.scale) + 'px';
		// this.domElement.style.height = (this.height / this.scale)+ 'px';
		this.domElement.style.width = this.width + 'px';
		this.domElement.style.height = this.height + 'px';
		if (this.entity && this.entity.meshDataComponent) {
			this.entity.meshDataComponent.meshData.xExtent = width * 0.5;
			this.entity.meshDataComponent.meshData.yExtent = height * 0.5;
			this.entity.meshDataComponent.meshData.rebuild();
			this.entity.meshDataComponent.meshData.setVertexDataUpdated();
			this.entity.transformComponent.transform.scale.scale(xdiff, ydiff, 1);
			this.entity.transformComponent.setUpdated();
		}
		this.updated = true;
	};

	return CSS3DComponent;
});
