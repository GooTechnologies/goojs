define([
		'goo/util/rsvp',
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
		'goo/loaders/AnimationLoader'
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
		AnimationLoader
	) {
	"use strict";
		/**
		 * @class Utility class for loading Animation Trees
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
			this._animationLoader = new AnimationLoader({ loader: this._loader });
		}

		/**
		 * Loads a tree of {@link AnimationClip}s, sets up an {@link AnimationManager} and returns it in an RSVP promise.
		 * It also start a default animation
		 * @example
		 * animTreeLoader.load('resources/animations/anims.tree', pose, 'idle').then(function(animManager) {
		 *   //handle {@link AnimationManager} animManager
		 * });
		 * @param {string} animTreePath The path, relative to loaders root path, where the animation tree file is stored
		 * @param {SkeletonPose} pose The pose to apply the animation clip to
		 * @param {string} name The name of the default animation to start
		 * @returns {RSVP.Promise}
		 */
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

			var promise = loadTree(animTreePath)
				.then(function(data) { root = data; return data; })
				.then(parseTree)
				.then(loadAndParseAnimations)
				.then(function(inputStore) {
					var outputStore = new OutputStore();
					return parseAnimationLayers(animationManager, inputStore, outputStore, root);
				}).then(setupDefaultAnimation);

			if(!this._cache[animTreePath]) {
				this._cache[animTreePath] = {};
			}
			this._cache[animTreePath][pose._skeleton._name] = promise;
			return promise;
		};

		AnimationTreeLoader.prototype._loadTree = function (animTreePath) {
			return this._loader.load(animTreePath);
		};

		AnimationTreeLoader.prototype._parseTree = function (animTree) {
			if (typeof animTree === 'string') {
				animTree = JSON.parse(animTree);
			}
			// read clip info
			if (!animTree.Clips || !animTree.Layers) {
				return false;
			}
			return animTree.Clips;
		};

		AnimationTreeLoader.prototype._loadAndParseAnimations = function (basePath, clips) {
			var loadAnimation = AnimationLoader.prototype._loadAnimation.bind(this);
			var parseAnimation;
			var promises = [];
			var inputStore = {};

			function storeInput(clip) {
				inputStore[clip._name] = clip;
			}
			for (var i = 0, max = clips.length; i < max; i++) {
				parseAnimation = AnimationLoader.prototype._parseAnimation.bind(this, clips[i].Name);
				promises.push(
					loadAnimation(basePath+clips[i].URL)
					.then(parseAnimation)
					.then(storeInput)
				);
			}
			return RSVP.all(promises).then(function() {
				return inputStore;
			});
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
			if (typeof root === 'string') {
				root = JSON.parse(root);
			}

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