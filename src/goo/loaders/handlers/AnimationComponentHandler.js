define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/AnimationComponent',
	'goo/math/MathUtils',
	'goo/util/rsvp',
	'goo/util/PromiseUtil'
],
/** @lends */
function(
	ComponentHandler,
	AnimationComponent,
	MathUtils,
	RSVP,
	pu
) {
	"use strict";

	/**
	* @class
	*/
	function AnimationComponentHandler() {
		ComponentHandler.apply(this, arguments);
	}

	AnimationComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	AnimationComponentHandler.prototype.constructor = AnimationComponentHandler;
	ComponentHandler._registerClass('animation', AnimationComponentHandler);

	AnimationComponentHandler.prototype._prepare = function(/*config*/) {};

	AnimationComponentHandler.prototype._create = function(entity/*, config*/) {
		var component = new AnimationComponent();
		entity.setComponent(component);
		return component;
	};

	AnimationComponentHandler.prototype.update = function(entity, config, options) {
		var that = this;

		var p1, p2;
		var component = ComponentHandler.prototype.update.call(this, entity, config);
		if (options && options.animation && options.animation.paused !== undefined) {
			if (options.animation.paused) {
				component.stop();
			} else {
				component.resume();
			}
		}
		var layersRef = config.layersRef;
		var poseRef = config.poseRef;
		var promises = [];
		if (!poseRef) {
			p1 = pu.createDummyPromise();
		} else {
			p1 = this.getConfig(poseRef).then(function(config) {
				that.updateObject(poseRef, config, that.options).then(function(pose) {
					return component._skeletonPose = pose;
				});
			});
		}

		promises.push(p1);

		if (!layersRef) {
			console.warn("No animation tree ref");
			p2 = pu.createDummyPromise([]);
		} else {
			p2 = this._getAnimationLayers(layersRef).then(function(layers) {
				return component.layers = layers;
			});
		}

		promises.push(p2);

		return RSVP.all(promises).then(function() {
			return component;
		});
	};

	AnimationComponentHandler.prototype._getAnimationLayers = function(ref) {
		var that = this;
		return this.getConfig(ref).then(function(config) {
			return that.updateObject(ref, config, that.options);
		});
	};

	return AnimationComponentHandler;
});
