define([
	'goo/entities/components/Component',
	'goo/shapes/Quad',
	'goo/entities/components/MeshRendererComponent',
	'goo/entities/components/MeshDataComponent'
],
function (
	Component,
	Quad,
	MeshRendererComponent,
	MeshDataComponent
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

		this.updated = true;
		this.entity = null;
		this.initDom(domElement);

		this.meshData = new Quad(1, 1);
		this.meshDataComponent = new MeshDataComponent(this.meshData);
		this.meshRendererComponent = new MeshRendererComponent();

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	HtmlComponent.type = 'HtmlComponent';

	HtmlComponent.prototype = Object.create(Component.prototype);
	HtmlComponent.prototype.constructor = HtmlComponent;

	HtmlComponent.prototype.attached = function (entity) {
		entity.setComponent(this.meshDataComponent);
		entity.setComponent(this.meshRendererComponent);
	};

	HtmlComponent.prototype.detached = function (entity) {
		if (this.domElement.parentNode !== null) {
			this.domElement.parentNode.removeChild(this.domElement);
		}
		entity.clearComponent('meshRendererComponent');
		entity.clearComponent('meshDataComponent');
	};

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
		if (domElement) {
			this.domElement.appendChild(domElement);
		}
		this.domElement.style.position = 'absolute';
		this.domElement.style.margin = '0px';
		this.domElement.style.padding = '0px';
		this.domElement.style.backgroundColor = 'white';
		this.domElement.style.WebkitBackfaceVisibility = this.backfaceVisibility;
		this.domElement.style.backfaceVisibility = this.backfaceVisibility;
		this.setSize(this.width, this.height);
	};

	HtmlComponent.prototype.setSize = function (width, height) {
		this.width = width || this.width;
		this.height = height || this.height;
		this.domElement.style.width = this.width + 'px';
		this.domElement.style.height = this.height + 'px';
	};

	HtmlComponent.prototype.destroy = function (context) {
		this.meshData.destroy(context);
	};

	return HtmlComponent;
});
