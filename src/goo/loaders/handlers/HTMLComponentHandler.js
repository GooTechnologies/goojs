define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/HTMLComponent',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil'
],
/** @lends */
function(
	ComponentHandler,
	HTMLComponent,
	RSVP,
	pu,
	_
) {
	"use strict";

	/**
	 * @class For handling loading of HTML components
	 * @constructor
	 * @param {World} world The goo world
	 * @param {function} getConfig The config loader function. See {@see DynamicLoader._loadRef}.
	 * @param {function} updateObject The handler function. See {@see DynamicLoader.update}.
	 * @extends ComponentHandler
	 * @private
	 */
	function HTMLComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'HTMLComponent';
	}

	HTMLComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	ComponentHandler._registerClass('html', HTMLComponentHandler);
	HTMLComponentHandler.prototype.constructor = HTMLComponentHandler;

	/**
	 * Prepare component. Set defaults on config here.
	 * @param {object} config
	 * @returns {object}
	 * @private
	 */
	HTMLComponentHandler.prototype._prepare = function (config) {};

	/**
	 * Create camera component object.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @returns {CameraComponent} the created component object
	 * @private
	 */
	HTMLComponentHandler.prototype._create = function () {
		return new HTMLComponent();
	};


	/**
	 * Update engine cameracomponent object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {object} config
	 * @param {object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	HTMLComponentHandler.prototype.update = function (entity, config, options) {
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			if (component.domElement) {
				component.domElement.parentNode.removeChild(component.domElement);
			}

			var domElement = document.createElement('div');
			component.domElement = domElement;

			domElement.style.position = 'absolute';
			domElement.style.zIndex = 3000;
			domElement.innerHTML = config.innerHTML;
			document.body.appendChild(domElement);
		});
	};

	return HTMLComponentHandler;
});
