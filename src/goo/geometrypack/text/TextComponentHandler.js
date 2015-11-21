var ComponentHandler = require('goo/loaders/handlers/ComponentHandler');
var TextComponent = require('goo/geometrypack/text/TextComponent');
var PromiseUtils = require('goo/util/PromiseUtils');

	'use strict';

	/**
	 * For handling loading of text components
	 * @param {World} world The goo world
	 * @param {Function} getConfig The config loader function.
	 * @param {Function} updateObject The handler function.
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
	 * Create a TextComponent object.
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
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	TextComponentHandler.prototype.update = function (entity, config, options) {
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			// load font

			return PromiseUtils.createPromise(function (resolve, reject) {
				opentype.load(config.font.fontRef, function (err, font) {
					if (err) {
						console.error(err);
						resolve(component);
						return;
					}

					var FONT_SIZE = 1;

					// smoothness is between 0 and 1
					// with 0 looking rough and choppy and 1 looking as smooth as possible
					var computeStepLength = function (fontSize, smoothness) {
						return ((1 - smoothness) * 0.08 + 0.01) * fontSize;
					};

					component.setFont(font);
					component.setText(config.text, {
						extrusion: config.extrusion,
						fontSize: FONT_SIZE,
						stepLength: computeStepLength(FONT_SIZE, config.smoothness),
						simplifyPaths: true
					});

					resolve(component);
				});
			});
		});
	};

	module.exports = TextComponentHandler;
