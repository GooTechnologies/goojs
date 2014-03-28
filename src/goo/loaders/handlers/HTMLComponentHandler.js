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

			var domElement = component.domElement;
			if (!domElement) {
				domElement = document.createElement('div');
				domElement.id = entity.id;
				domElement.addEventListener('mousedown', function(domEvent) {
					console.log('Picked a html entity');
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
				component.domElement = domElement;
				domElement.style.position = 'absolute';
				domElement.style.zIndex = 3000;
				entity._world.gooRunner.renderer.domElement.parentElement.appendChild(domElement);
			}
			domElement.innerHTML = config.innerHTML;
		});
	};

	HTMLComponentHandler.prototype._remove = function (entity) {
		ComponentHandler.prototype._remove.call(this, entity);
		var component = entity.htmlComponent;
		if (component.domElement) {
			component.domElement.parentNode.removeChild(component.domElement);
		}
	}

	return HTMLComponentHandler;
});
