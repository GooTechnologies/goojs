define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/HtmlComponent',
	'goo/util/rsvp',
	'goo/util/PromiseUtil'
], function (
	ComponentHandler,
	HtmlComponent,
	RSVP,
	PromiseUtil
) {
	'use strict';

	/**
	 * For handling loading of HTML components
	 * @param {World} world The goo world
	 * @param {function} getConfig The config loader function. See {@see DynamicLoader._loadRef}.
	 * @param {function} updateObject The handler function. See {@see DynamicLoader.update}.
	 * @extends ComponentHandler
	 * @hidden
	 */
	function HtmlComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'HtmlComponent';
	}

	HtmlComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	ComponentHandler._registerClass('html', HtmlComponentHandler);
	HtmlComponentHandler.prototype.constructor = HtmlComponentHandler;

	/**
	 * Prepare component. Set defaults on config here.
	 * @param {object} config
	 * @returns {object}
	 * @private
	 */
	HtmlComponentHandler.prototype._prepare = function (/*config*/) {};

	/**
	 * Create camera component object.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @returns {CameraComponent} the created component object
	 * @private
	 */
	HtmlComponentHandler.prototype._create = function () {
		return new HtmlComponent();
	};

	var regex = /\W/g;
	function getSafeEntityId(id) {
		// fancy chars (like '.') are allowed in ids in HTML but are not allowed in CSS
		return '__' + id.replace(regex, '-');
	}

	/**
	 * Update engine cameracomponent object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {object} config
	 * @param {object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	HtmlComponentHandler.prototype.update = function (entity, config, options) {
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
				domElement.addEventListener('mousedown', function (domEvent) {
					var gooRunner = entity._world.gooRunner;
					var evt = {
						entity: entity,
						depth: 0,
						x: domEvent.pageX,
						y: domEvent.pageY,
						domEvent: domEvent,
						id: entity.id,
						type: 'mousedown'
					};
					gooRunner.triggerEvent('mousedown', evt);
				});
				domElement.addEventListener('mouseup', function (domEvent) {
					var gooRunner = entity._world.gooRunner;
					var evt = {
						entity: entity,
						depth: 0,
						x: domEvent.pageX,
						y: domEvent.pageY,
						domEvent: domEvent,
						id: entity.id,
						type: 'mouseup'
					};
					gooRunner.triggerEvent('mouseup', evt);
				});
				domElement.addEventListener('click', function (domEvent) {
					var gooRunner = entity._world.gooRunner;
					var evt = {
						entity: entity,
						depth: 0,
						x: domEvent.pageX,
						y: domEvent.pageY,
						domEvent: domEvent,
						id: entity.id,
						type: 'click'
					};
					gooRunner.triggerEvent('click', evt);
				});
				component.domElement = domElement;
				domElement.style.position = 'absolute';
				domElement.style.top = 0;
				domElement.style.left = 0;
				domElement.style.zIndex = 1;
				domElement.style.display = 'none';

				var parentEl = entity._world.gooRunner.renderer.domElement.parentElement || document.body;

				parentEl.appendChild(domElement);
			}

			var innerHtmlChanged = config.innerHtml !== domElement.prevInnerHtml;
			var styleChanged = config.style !== domElement.prevStyle;
			domElement.prevInnerHtml = config.innerHtml;
			domElement.prevStyle = config.style;

			component.useTransformComponent = config.useTransformComponent !== false;

			if (!innerHtmlChanged && !styleChanged) {
				return PromiseUtil.resolve();
			}

			var wrappedStyle = '';
			if (config.style) {
				var processedStyle = config.style.replace('__entity', '#' + safeEntityId);
				wrappedStyle = '<style>\n' + processedStyle + '\n</style>';
			}

			domElement.innerHTML = wrappedStyle + config.innerHtml;

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

	HtmlComponentHandler.prototype._remove = function (entity) {
		var component = entity.htmlComponent;
		ComponentHandler.prototype._remove.call(this, entity);
		if (component.domElement) {
			component.domElement.parentNode.removeChild(component.domElement);
		}
	};

	return HtmlComponentHandler;
});
