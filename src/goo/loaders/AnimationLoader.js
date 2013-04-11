/*jshint bitwise: false */
define([
		'goo/lib/rsvp.amd',
		'goo/renderer/MeshData',
		'goo/renderer/Shader',
		'goo/renderer/TextureCreator',
		'goo/renderer/Material',
		'goo/loaders/Loader',
		'goo/animation/state/loader/OutputStore',
		'goo/animation/AnimationManager',
		'goo/animation/blendtree/SimpleAnimationApplier',
		'goo/loaders/JsonUtils',
		'goo/animation/clip/AnimationClip',
		'goo/animation/clip/JointChannel',
		'goo/animation/clip/TransformChannel',
		'goo/animation/clip/InterpolatedFloatChannel',
		'goo/animation/state/SteadyState',
		'goo/animation/blendtree/ClipSource'
	],
	/** @lends */
	function(
		RSVP,
		MeshData,
		Shader,
		TextureCreator,
		Material,
		Loader,
		OutputStore,
		AnimationManager,
		SimpleAnimationApplier,
		JsonUtils,
		AnimationClip,
		JointChannel,
		TransformChannel,
		InterpolatedFloatChannel,
		SteadyState,
		ClipSource
	) {
	"use strict";
		/**
		 * @class Utility class for loading Animations
		 *
		 * @constructor
		 * @desc Creates an instance of an {@link AnimationLoader}
		 * @param {object} parameters
		 * @param {Loader} parameters.loader
		 */
		function AnimationLoader(parameters) {
			if(typeof parameters === "undefined" || parameters === null) {
				throw new Error('AnimationTreeLoader(): Argument `parameters` was undefined/null');
			}
			if(typeof parameters.loader === "undefined" || !(parameters.loader instanceof Loader) || parameters.loader === null) {
				throw new Error('AnimationTreeLoader(): Argument `parameters.loader` was invalid/undefined/null');
			}

			this._loader = parameters.loader;
			this._cache = {};
		}

		/**
		 * Loads an {@link AnimationClip}, sets up an {@link AnimationManager} and returns it in an RSVP promise.
		 * It also starts a default animation.
		 * @example
		 * animLoader.load('resources/animations/anim.clip', pose, 'idle').then(function(animManager) {
		 *   //handle {@link AnimationManager} animManager
		 * });
		 * @param {string} animPath The path, relative to loaders root path, where the animation clip file is stored
		 * @param {SkeletonPose} pose The pose to apply the animation clip to
		 * @param {string} name The name of the default animation to start
		 * @returns {RSVP.Promise}
		 */
		AnimationLoader.prototype.load = function (animPath, pose, name) {
			if(this._cache[animPath] && this._cache[animPath][pose._skeleton._name]) {
				return this._cache[animPath][pose._skeleton.name];
			}

			var animationManager = new AnimationManager(pose);
			animationManager._applier = new SimpleAnimationApplier();

			var loadAnimation = AnimationLoader.prototype._loadAnimation.bind(this);
			var parseAnimation = AnimationLoader.prototype._parseAnimation.bind(this, name);
			var setupDefaultAnimation = AnimationLoader.prototype._setupDefaultAnimation.bind(this, animationManager, name);

			var promise = loadAnimation(animPath)
			.then(parseAnimation)
			.then(setupDefaultAnimation);


			if (!this._cache[animPath]) {
				this._cache[animPath] = {};
			}
			this._cache[animPath][pose._skeleton._name] = promise;
			return promise;
		};

		AnimationLoader.prototype._loadAnimation = function(animPath) {
			return this._loader.load(animPath);
		};

		AnimationLoader.prototype._parseAnimation = function(name, clipSource) {
			clipSource = JSON.parse(clipSource);
			var useCompression, compressedAnimRange;
			var clip = new AnimationClip(name);

			// check if we're compressed or not.
			useCompression = clipSource.UseCompression || false;

			if (useCompression) {
				compressedAnimRange = clipSource.CompressedRange || (1 << 15) - 1; // int
			}

			// parse channels
			if (clipSource.Channels) {
				var array = clipSource.Channels;
				for (var i = 0, max = array.length; i < max; i++) {
					var chanObj = array[i];
					var type = chanObj.Type;
					var name = chanObj.Name;
					var times = JsonUtils.parseChannelTimes(chanObj, useCompression);
					var channel;
					if ("Joint" === type) {
						var jointName = chanObj.JointName;
						var jointIndex = chanObj.JointIndex;
						var rots = JsonUtils.parseRotationSamples(chanObj, compressedAnimRange, useCompression);
						var trans = JsonUtils.parseTranslationSamples(chanObj, times.length, useCompression);
						var scales = JsonUtils.parseScaleSamples(chanObj, times.length, useCompression);
						channel = new JointChannel(jointName, jointIndex, times, rots, trans, scales);
					} else if ("Transform" === type) {
						var rots = JsonUtils.parseRotationSamples(chanObj, compressedAnimRange, useCompression);
						var trans = JsonUtils.parseTranslationSamples(chanObj, times.length, useCompression);
						var scales = JsonUtils.parseScaleSamples(chanObj, times.length, useCompression);
						channel = new TransformChannel(name, times, rots, trans, scales);
					} else if ("FloatLERP" === type) {
						channel = new InterpolatedFloatChannel(name, times, JsonUtils.parseFloatLERPValues(chanObj, useCompression));
					} else {
						console.warn("Unhandled channel type: " + type);
						continue;
					}
					clip.addChannel(channel);
				}
			}
			return clip;
		};

		AnimationLoader.prototype._setupDefaultAnimation = function(animationManager, name, clip) {
			var state = new SteadyState(name);
			var source = new ClipSource(clip, animationManager);
			state._sourceTree = source;

			animationManager._layers[0]._steadyStates[state._name] = state;
			animationManager.getClipInstance(clip)._loopCount = -1;
			animationManager.getClipInstance(clip)._timeScale = 1.0;
			animationManager._layers[0].setCurrentStateByName(name, true);

			return animationManager;
		};


		return AnimationLoader;
	}
);

