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
		'goo/animation/clip/InterpolatedFloatChannel'
	],
	/** @lends AnimationTreeLoader */
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
		InterpolatedFloatChannel
	) {
	"use strict";
		/**
		 * Utility class for loading Animation Trees
		 *
		 * @constructor
		 * @param {{ loader: Loader }} parameters
		 */
		function AnimationTreeLoader(parameters) {
			if(typeof parameters === "undefined" || parameters === null) {
				throw new Error('AnimationTreeLoader(): Argument `parameters` was undefined/null');
			}
			if(typeof parameters.loader === "undefined" || !(parameters.loader instanceof Loader) || parameters.loader === null) {
				throw new Error('AnimationTreeLoader(): Argument `parameters.loader` was invalid/undefined/null');
			}

			this._loader = parameters.loader;
			this._cache = {};
		}

		AnimationTreeLoader.prototype.load = function (animTreePath, pose, name) {
			if(this._cache[animTreePath] && this._cache[animTreePath][pose._skeleton._name]) {
				return this._cache[animTreePath][pose._skeleton._name];
			}

			var animationManager = new AnimationManager(pose);
			animationManager._applier = new SimpleAnimationApplier();

			var animTreeBase = animTreePath.match(/.*\//);
			if (animTreeBase.length === 1) {
				animTreeBase = animTreeBase[0];
			} else {
				animTreeBase = '';
			}

			var loadTree = AnimationTreeLoader.prototype._loadTree.bind(this);
			var parseTree = AnimationTreeLoader.prototype._parseTree.bind(this);
			var loadAndParseAnimations = AnimationTreeLoader.prototype._loadAndParseAnimations.bind(this, animTreeBase);
			var parseAnimationLayers = AnimationTreeLoader.prototype._parseAnimationLayers.bind(this);
			var setupDefaultAnimation = AnimationTreeLoader.prototype._setupDefaultAnimation.bind(this, name);
			var root;
			var outputStore = new OutputStore();

			var promise = loadTree(animTreePath)
				.then(function(data) { root = data; return data; })
				.then(parseTree)
				.then(loadAndParseAnimations)
				.then(function(inputStore) {
					return parseAnimationLayers(animationManager, inputStore, outputStore, root);
				}).then(setupDefaultAnimation);

			if(!this._cache[animTreePath]) {
				this._cache[animTreePath] = {};
			}
			this._cache[animTreePath][pose._skeleton._name] = promise;
			return promise;
		};

		AnimationTreeLoader.prototype._loadTree = function (animTreePath) {
			return this._loader.load(animTreePath+'.json');
		};

		AnimationTreeLoader.prototype._parseTree = function (animTree) {
			// read clip info
			if (!animTree.Clips || !animTree.Layers) {
				return false;
			}
			return animTree.Clips;
		};

		AnimationTreeLoader.prototype._loadAndParseAnimations = function (basePath, clips) {
			var loadAnimation = AnimationTreeLoader.prototype._loadAnimation.bind(this, basePath);
			var parseAnimation;
			var promises = [];
			var inputStore = {};

			for (var i = 0, max = clips.length; i < max; i++) {
				parseAnimation = AnimationTreeLoader.prototype._parseAnimation.bind(this, clips[i].Name, inputStore);
				promises.push(loadAnimation(clips[i]).then(parseAnimation));
			}
			return RSVP.all(promises).then(function() {
				return inputStore;
			});
		};

		AnimationTreeLoader.prototype._loadAnimation = function (basePath, clipPath) {
			return this._loader.load(basePath+clipPath.URL+'.json');
		};

		AnimationTreeLoader.prototype._parseAnimation = function (storeName, inputStore, clipSource) {
			var useCompression, compressedAnimRange;
			var clip = new AnimationClip(storeName);

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
			inputStore[storeName] = clip;
			return clip;
		};

		AnimationTreeLoader.prototype._parseAnimationLayers = function (manager, inputStore, outputStore, root) {
			var promise = new RSVP.Promise();
			var completeCallback = {
				onSuccess: function() {
					promise.resolve(manager);
				},
				onError: function(error) {
					promise.reject(error);
				}
			};
			JsonUtils.parseAnimationLayers(manager, completeCallback, inputStore, outputStore, root);
			return promise;
		};

		AnimationTreeLoader.prototype._setupDefaultAnimation = function (name, manager) {
			if(name) {
				manager.getBaseAnimationLayer().setCurrentStateByName(name, true);
			}
			return manager;
		};

		return AnimationTreeLoader;
	}
);