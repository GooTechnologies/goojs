define([
	'goo/entities/components/Component'
],
function (
	Component
) {
	'use strict';

	/**
	 * Connects a domElement to an entity and applies the transforms of the entity to the domElement with CSS3 3D transforms.
	 * @param {domElement} domElement
	 * @param {Object} settings
	 * @extends Component
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/entities/components/HTMLComponent/HTMLComponent-vtest.html Working example
	 */
	function HtmlComponent(domElement, settings) {
		Component.apply(this, arguments);

		this.type = 'HtmlComponent';

		settings = settings || {};

		/**
		 * @type {boolean}
		 */
		this.hidden = false;

		this.useTransformComponent = settings.useTransformComponent !== undefined ? settings.useTransformComponent : true;
		this.width = settings.width || 100;
		this.height = settings.height || 100;
		this.backfaceVisibility = settings.backfaceVisibility || 'hidden'; //'visible'
		this.faceCamera = settings.faceCamera !== undefined ? settings.faceCamera : false;
		this.updated = true;
		this.entity = null;

		this.initDom(domElement);

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	HtmlComponent.type = 'HtmlComponent';

	HtmlComponent.prototype = Object.create(Component.prototype);
	HtmlComponent.prototype.constructor = HtmlComponent;

	HtmlComponent.prototype.initDom = function (domElement) {
		if (this.domElement && this.domElement.parentNode !== null) {
			this.domElement.parentNode.removeChild(this.domElement);
		}
		if (!this.useTransformComponent) {
			this.domElement = domElement;
			domElement.style.position = 'absolute';
			return;
		}
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

	HtmlComponent.prototype.setSize = function (width, height) {
		var xdiff = this.width / width;
		var ydiff = this.height / height;
		this.width = width || this.width;
		this.height = height || this.height;
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

	return HtmlComponent;
});
