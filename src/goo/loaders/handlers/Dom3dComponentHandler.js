var ComponentHandler = require('../../loaders/handlers/ComponentHandler');
var Dom3dComponent = require('../../entities/components/Dom3dComponent');
var RSVP = require('../../util/rsvp');
var PromiseUtils = require('../../util/PromiseUtils');



	/**
	 * For handling loading of Dom3d components
	 * @param {World} world The goo world
	 * @param {Function} getConfig The config loader function. See {@see DynamicLoader._loadRef}.
	 * @param {Function} updateObject The handler function. See {@see DynamicLoader.update}.
	 * @extends ComponentHandler
	 * @hidden
	 */
	function Dom3dComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'Dom3dComponent';
	}

	Dom3dComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	ComponentHandler._registerClass('dom3d', Dom3dComponentHandler);
	Dom3dComponentHandler.prototype.constructor = Dom3dComponentHandler;

	/**
	 * Prepare component. Set defaults on config here.
	 * @param {Object} config
	 * @returns {Object}
	 * @private
	 */
	Dom3dComponentHandler.prototype._prepare = function (/*config*/) {};

	/**
	 * Create camera component object.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @returns {CameraComponent} the created component object
	 * @private
	 */
	Dom3dComponentHandler.prototype._create = function () {
		return new Dom3dComponent();
	};

	var regex = /\W/g;
	function getSafeEntityId(id) {
		// fancy chars (like '.') are allowed in ids in HTML but are not allowed in CSS
		return '__' + id.replace(regex, '-');
	}

	/**
	 * Update engine cameracomponent object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	Dom3dComponentHandler.prototype.update = function (entity, config, options) {
		var that = this;
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			// ids and classes can contain '.' or start with digits in html but not in css selectors
			// could have prefixed it with a simple '-' but that's sort of reserved for '-moz', '-webkit' and the like
			var safeEntityId = getSafeEntityId(entity.id);

			var domElement = component.domElement;
			if (!domElement) {
				domElement = document.createElement('div');
				domElement.id = safeEntityId;
				domElement.className = 'goo-entity';
				component.initDom(domElement);
			}
			component.setSize(config.width !== undefined ? config.width : 500, config.height !== undefined ? config.height : 500);

			var innerHtmlChanged = config.innerHtml !== domElement.prevInnerHtml;
			var styleChanged = config.style !== domElement.prevStyle;
			domElement.prevInnerHtml = config.innerHtml;
			domElement.prevStyle = config.style;

			if (entity.meshRendererComponent !== component.meshRendererComponent) {
				entity.setComponent(component.meshRendererComponent);
			}
			if (entity.meshDataComponent !== component.meshDataComponent) {
				entity.setComponent(component.meshDataComponent);
			}
			if (!innerHtmlChanged && !styleChanged) {
				return PromiseUtils.resolve();
			}

			var wrappedStyle = '';
			if (config.style) {
				var processedStyle = config.style.replace('__entity', '#' + safeEntityId);
				wrappedStyle = '<style>\n' + processedStyle + '\n</style>';
			}

			domElement.innerHTML = wrappedStyle + config.innerHtml;

			var children = domElement.childNodes;
			if (children.length === 1) {
				var child = children[0];
				if (!child.style.width) {
					child.style.width = "100%";
				}
				if (!child.style.height) {
					child.style.height = "100%";
				}
			}

			function loadImage(htmlImage, imageRef) {
				return that.loadObject(imageRef, options)
				.then(function (image) {
					htmlImage.src = image.src;
					return htmlImage;
				}, function (e) {
					console.error(e);
					delete htmlImage.src;
					return htmlImage;
				});
			}

			// Fix images.
			var images = domElement.getElementsByTagName('IMG');
			var imagePromises = [];
			for (var i = 0; i < images.length; i++) {
				var htmlImage = images[i];
				var imageRef = htmlImage.getAttribute('data-id');
				if (imageRef) {
					var promise = loadImage(htmlImage, imageRef);
					imagePromises.push(promise);
				}
			}

			return RSVP.all(imagePromises);
		});
	};

	Dom3dComponentHandler.prototype._remove = function (entity) {
		var component = entity.dom3dComponent;
		ComponentHandler.prototype._remove.call(this, entity);
		if (component.domElement && component.domElement.parentNode) {
			component.domElement.parentNode.removeChild(component.domElement);
		}

		if (entity.meshRendererComponent || entity.meshDataComponent) {
			entity.clearComponent('meshDataComponent');
			entity.clearComponent('meshRendererComponent');
		}
		component.destroy(this.world.gooRunner.renderer.context);
	};

	module.exports = Dom3dComponentHandler;
