var ComponentHandler = require('../../loaders/handlers/ComponentHandler');
var HtmlComponent = require('../../entities/components/HtmlComponent');
var RSVP = require('../../util/rsvp');
var PromiseUtils = require('../../util/PromiseUtils');

'use strict';

/**
 * For handling loading of HTML components
 * @param {World} world The goo world
 * @param {Function} getConfig The config loader function. See {@see DynamicLoader._loadRef}.
 * @param {Function} updateObject The handler function. See {@see DynamicLoader.update}.
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
 * @param {Object} config
 * @returns {Object}
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
 * @param {Object} config
 * @param {Object} options
 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
 */
HtmlComponentHandler.prototype.update = function (entity, config, options) {
	var that = this;
	return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
		if (!component) { return; }

		var domElement = component.domElement;
		if (!domElement) {
			domElement = component.domElement = that._createDomElement(entity, component);
			that._attachDomElement(domElement, entity);
		}

		component.useTransformComponent = config.useTransformComponent !== false;
		component.pixelPerfect = config.pixelPerfect !== undefined ? config.pixelPerfect : true;

		var innerHtmlChanged = config.innerHtml !== domElement.prevInnerHtml;
		var styleChanged = config.style !== domElement.prevStyle;
		domElement.prevInnerHtml = config.innerHtml;
		domElement.prevStyle = config.style;

		var promise = null;

		if (innerHtmlChanged || styleChanged) {
			promise = that._updateHtml(domElement, entity, config, options);
		} else {
			promise = that._updateAttributes(domElement, entity, config);
		}

		return promise.then(function () {
			return component;
		});
	});
};

/**
 * Creates a new dom element for the specified component.
 *
 * @param {Entity} entity
 *        The entity to which the component belongs.
 * @param {HtmlComponent} component
 *        The HTML component whose DOM element is to be created.
 *
 * @return {Element}
 *         The new dom element.
 */
HtmlComponentHandler.prototype._createDomElement = function (entity) {
	var domElement = document.createElement('div');

	// ids and classes can contain '.' or start with digits in html but not in css selectors
	// could have prefixed it with a simple '-' but that's sort of reserved for '-moz', '-webkit' and the like
	domElement.id = getSafeEntityId(entity.id);

	domElement.className = 'goo-entity';

	this._addMouseListeners(domElement, entity);
	this._addTouchListeners(domElement, entity);

	return domElement;
};

HtmlComponentHandler.prototype._addMouseListeners = function (domElement, entity) {
	var mouseListener = function (domEvent) {
		var gooRunner = entity._world.gooRunner;
		var evt = {
			entity: entity,
			depth: 0,
			x: domEvent.pageX,
			y: domEvent.pageY,
			domEvent: domEvent,
			id: entity.id,
			type: domEvent.type
		};
		gooRunner.triggerEvent(domEvent.type, evt);
	};
	domElement.addEventListener('mousedown', mouseListener);
	domElement.addEventListener('mouseup', mouseListener);
	domElement.addEventListener('click', mouseListener);
};

HtmlComponentHandler.prototype._addTouchListeners = function (domElement, entity) {
	var touchListener = function (domEvent) {
		var gooRunner = entity._world.gooRunner;
		var domTarget = gooRunner.renderer.domElement;

		var x = domEvent.changedTouches[0].pageX - domTarget.getBoundingClientRect().left;
		var y = domEvent.changedTouches[0].pageY - domTarget.getBoundingClientRect().top;

		var evt = {
			entity: entity,
			depth: 0,
			x: x,
			y: y,
			domEvent: domEvent,
			id: entity.id,
			type: domEvent.type
		};
		gooRunner.triggerEvent(domEvent.type, evt);
	};
	domElement.addEventListener('touchstart', touchListener);
	domElement.addEventListener('touchmove', touchListener);
	domElement.addEventListener('touchend', touchListener);
};

/**
 * Attaches the specified element to the parent of the renderer's canvas.
 *
 * @param {Element} domElement
 *        The dom element which is to be attached.
 * @param {Entity} entity
 *        The entity to which the HTML component belongs.
 *
 * @private
 */
HtmlComponentHandler.prototype._attachDomElement = function (domElement, entity) {
	var parentEl = entity._world.gooRunner.renderer.domElement.parentElement || document.body;
	parentEl.appendChild(domElement);
};

/**
 * Updates the HTML content of the specified dom element based on the config.
 *
 * @param {Element} domElement
 *        The html element which is to be updated.
 * @param {Entity} entity
 *        The entity to which the HTML component belongs.
 * @param {object} config
 *        The configuration of the component.
 * @param {object} options
 *        The options passed to the handler by the DynamicLoader.
 *
 * @return {Promise}
 * @private
 */
HtmlComponentHandler.prototype._updateHtml = function (domElement, entity, config, options) {
	var wrappedStyle = '';
	if (config.style) {
		var processedStyle = config.style.replace('__entity', '#' + getSafeEntityId(entity.id));
		wrappedStyle = '<style>\n' + processedStyle + '\n</style>';
	}

	domElement.innerHTML = wrappedStyle + config.innerHtml;
	this._updateAttributes(domElement, entity, config);

	return this._loadImages(domElement, options);
};

/**
 * Loads all the images referenced in the HTML of the specified DOM element.
 *
 * @param {Element} domElement
 *        The element whose images are to be loaded.
 * @param {objects} options
 *        Options passed to the handler by the DynamicLoader.
 *
 * @return {Promise}
 * @private
 */
HtmlComponentHandler.prototype._loadImages = function (domElement, options) {
	var that = this;

	function loadImage(htmlImage) {
		var imageRef = htmlImage.getAttribute('data-id');
		if (!imageRef) { return PromiseUtils.resolve(); }

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

	var images = [].slice.apply(domElement.getElementsByTagName('IMG'));
	return RSVP.all(images.map(loadImage));
};

/**
 * Sets all the attributes that are in the configuration (if any) on the
 * specified dom element.
 *
 * @param {Element} domElement
 *        The dom element on which the attributes are to be set.
 * @param {object} config
 *        The configuration object.
 *
 * @return {Promise}
 * @private
 */
HtmlComponentHandler.prototype._updateAttributes = function (domElement, entity, config) {
	var attrs = config.attributes || {};
	var attrNames = Object.keys(attrs);
	while (attrNames.length) {
		var name = attrNames.pop();
		var value = config.attributes[name];
		domElement.setAttribute(name, value);
	}

	// Set default styles if no style was set by the user.
	if (!attrs.style) {
		domElement.setAttribute('style', 'position: absolute; top: 0; left: 0; z-index: 1; display: none');
	}

	// We need to have the HTML system update again so we clear the style
	// cache.
	entity._world.getSystem('HtmlSystem').clearStyleCache(domElement);

	return PromiseUtils.resolve();
};

HtmlComponentHandler.prototype._remove = function (entity) {
	var component = entity.htmlComponent;
	ComponentHandler.prototype._remove.call(this, entity);
	if (component.domElement) {
		component.domElement.parentNode.removeChild(component.domElement);
	}
};

module.exports = HtmlComponentHandler;
