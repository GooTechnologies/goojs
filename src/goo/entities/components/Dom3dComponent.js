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
	 * @class
	 * @class
	 * Connects a domElement to an entity and applies the transforms of the entity to the domElement with CSS3 3D transforms.
	 * @param {domElement} domElement
	 * @param {Object} settings
	 * @extends Component
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/entities/components/Dom3dComponent/Dom3dComponent-vtest.html Working example
	 */
	function Dom3dComponent(domElement, settings) {
		Component.apply(this, arguments);

		this.type = 'Dom3dComponent';

		settings = settings || {};

		/**
		 * @type {boolean}
		 */
		this.hidden = false;

		this.width = settings.width || 500;
		this.height = settings.height || 500;
		this.backfaceVisibility = settings.backfaceVisibility || 'hidden';

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

	Dom3dComponent.type = 'Dom3dComponent';

	Dom3dComponent.prototype = Object.create(Component.prototype);
	Dom3dComponent.prototype.constructor = Dom3dComponent;

	Dom3dComponent.prototype.attached = function (entity) {
		entity.setComponent(this.meshDataComponent);
		entity.setComponent(this.meshRendererComponent);
	};

	Dom3dComponent.prototype.detached = function (entity) {
		if (this.domElement.parentNode !== null) {
			this.domElement.parentNode.removeChild(this.domElement);
		}
		entity.clearComponent('meshRendererComponent');
		entity.clearComponent('meshDataComponent');
	};

	Dom3dComponent.prototype.initDom = function (domElement) {
		if (this.domElement && this.domElement.parentNode !== null) {
			this.domElement.parentNode.removeChild(this.domElement);
		}
		this.domElement = document.createElement('div');
		if (domElement) {
			if (!domElement.style.width) {
				domElement.style.width = "100%";
			}
			if (!domElement.style.height) {
				domElement.style.height = "100%";
			}
			this.domElement.appendChild(domElement);
		}
		this.domElement.style.position = 'absolute';
		this.domElement.style.margin = '0px';
		this.domElement.style.padding = '0px';
		this.domElement.style.backgroundColor = 'white';
		// this.domElement.style.WebkitBackfaceVisibility = this.backfaceVisibility;
		this.domElement.style.backfaceVisibility = this.backfaceVisibility;
		this.domElement.style.overflow = 'hidden';
		this.setSize(this.width, this.height);
	};

	Dom3dComponent.prototype.setSize = function (width, height) {
		this.width = width || this.width;
		this.height = height || this.height;
		this.domElement.style.width = this.width + 'px';
		this.domElement.style.height = this.height + 'px';
	};

	Dom3dComponent.prototype.destroy = function (context) {
		this.meshData.destroy(context);
	};

	return Dom3dComponent;
});
