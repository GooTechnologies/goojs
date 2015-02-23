define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/geometrypack/text/TextComponent',
	'goo/util/PromiseUtil'
], function (
	ComponentHandler,
	TextComponent,
	PromiseUtil
) {
	'use strict';

	/**
	 * For handling loading of text components
	 * @param {World} world The goo world
	 * @param {function} getConfig The config loader function.
	 * @param {function} updateObject The handler function.
	 * @extends ComponentHandler
	 * @hidden
	 */
	function TextComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'TextComponent';
	}

	TextComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	TextComponentHandler.prototype.constructor = TextComponentHandler;

	ComponentHandler._registerClass('text', TextComponentHandler);

	/**
	 * Create a quadcomponent object.
	 * @returns {TextComponent} the created component object
	 * @private
	 */
	TextComponentHandler.prototype._create = function () {
		return new TextComponent();
	};

	/**
	 * Removes the quadcomponent from the entity.
	 * @param {Entity} entity
	 * @private
	 */
	TextComponentHandler.prototype._remove = function (entity) {
		//if (this.world && this.world.gooRunner) {
		//	entity.textComponent.destroy(this.world.gooRunner.renderer.context);
		//}
		entity.clearComponent('TextComponent');
	};

	/**
	 * Update engine textComponent object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {object} config
	 * @param {object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	TextComponentHandler.prototype.update = function (entity, config, options) {
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			// load font

			return PromiseUtil.createPromise(function (resolve, reject) {
				opentype.load(config.fontURL, function (err, font) {
					if (err) {
						console.error();
						resolve(component);
						return;
					}

					component.setFont(font);
					component.setText(config.text, {
						extrusion: config.extrusion,
						fontSize: config.fontSize,
						stepLength: config.stepLength,
						simplifyPaths: config.simplifyPaths
					});

					resolve(component);
				});
			});
			/*// Load material
			return this._load(config.materialRef, options).then(function (material) {
				// setting this here until the frontend sends good values
				material.cullState.enabled = true;

				// If the component already has these components, they need to be overridden
				if (entity.meshDataComponent !== component.meshDataComponent) {
					entity.setComponent(component.meshDataComponent);
				}

				component.setMaterial(material);
				component.setText();
				component.meshDataComponent.autoCompute = true;

				return component;
			});*/
		}.bind(this));
	};

	return TextComponentHandler;
});
