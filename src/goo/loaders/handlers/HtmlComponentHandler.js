define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/HtmlComponent'
],
/** @lends */
function(
	ComponentHandler,
	HtmlComponent
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


	/**
	 * Update engine cameracomponent object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {object} config
	 * @param {object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	HtmlComponentHandler.prototype.update = function (entity, config, options) {
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			var domElement = component.domElement;
			if (!domElement) {
				domElement = document.createElement('div');
				domElement.id = entity.id;
				domElement.className = 'goo-entity'
				domElement.addEventListener('mousedown', function(domEvent) {
					var gooRunner = entity._world.gooRunner;
					var evt = {
						entity: entity,
						depth:0,
						x: domEvent.pageX,
						y: domEvent.pageY,
						domEvent: domEvent,
						id: entity.id,
						type: 'mousedown'
					};
					gooRunner.triggerEvent('mousedown', evt);
				});
				domElement.addEventListener('mouseup', function(domEvent) {
					console.log('HTML Mouseup');
					var gooRunner = entity._world.gooRunner;
					var evt = {
						entity: entity,
						depth:0,
						x: domEvent.pageX,
						y: domEvent.pageY,
						domEvent: domEvent,
						id: entity.id,
						type: 'mouseup'
					};
					gooRunner.triggerEvent('mouseup', evt);
				});
				domElement.addEventListener('click', function(domEvent) {
					console.log('HTML Click');
					var gooRunner = entity._world.gooRunner;
					var evt = {
						entity: entity,
						depth:0,
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
				var parentEl = entity._world.gooRunner.renderer.domElement.parentElement || document.body;
				parentEl.appendChild(domElement);
			}
			domElement.innerHTML = config.innerHTML;
			component.useTransformComponent = config.useTransformComponent == null ? true: config.useTransformComponent;
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
