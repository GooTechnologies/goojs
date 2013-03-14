define([
		'goo/animation/Skeleton',
		'goo/animation/SkeletonPose',
		'goo/animation/Joint',
		'goo/loaders/Loader',
		'goo/loaders/JsonUtils'
	],
	/** @lends SkeletonLoader */
	function(
		Skeleton,
		SkeletonPose,
		Joint,
		Loader,
		JsonUtils
	) {
	"use strict";
		/**
		 * Utility class for loading Animation Trees
		 */
		function SkeletonLoader(parameters) {
			if(typeof parameters === "undefined" || parameters === null) {
				throw new Error('SkeletonLoader(): Argument `parameters` was undefined/null');
			}

			if(typeof parameters.loader === "undefined" || !(parameters.loader instanceof Loader) || parameters.loader === null) {
				throw new Error('SkeletonLoader(): Argument `parameters.loader` was invalid/undefined/null');
			}

			this._loader = parameters.loader;

			this._cache = {};

		}

		SkeletonLoader.prototype.load = function (skeletonPath) {
			if (this._cache[skeletonPath]) {
				return this._cache[skeletonPath];
			}

			var loadSkeleton = SkeletonLoader.prototype._loadSkeleton.bind(this);
			var parseSkeleton = SkeletonLoader.prototype._parseSkeleton.bind(this);
			var createSkeletonPose = SkeletonLoader.prototype._createSkeletonPose.bind(this);

			var promise = loadSkeleton(skeletonPath)
			.then(parseSkeleton)
			.then(createSkeletonPose);

			this._cache[skeletonPath] = promise;
			return promise;
		};

		SkeletonLoader.prototype._loadSkeleton = function (skeletonPath) {
			return this._loader.load(skeletonPath+'.json');
		};


		SkeletonLoader.prototype._parseSkeleton = function (skeleton) {
			var skName = skeleton.Name;
			var jointArray = skeleton.Joints;
			var joints = [];

			for (var j = 0, maxJ = jointArray.length; j < maxJ; j++) {
				var jointObj = jointArray[j];
				var jName = jointObj.Name;
				var joint = new Joint(jName);

				joint._index = Math.round(jointObj.Index);
				joint._parentIndex = Math.round(jointObj.ParentIndex);
				joint._inverseBindPose.copy(JsonUtils.parseTransform(jointObj.InverseBindPose));
				joint._inverseBindPose.update();
				joints[j] = joint;
			}

			return new Skeleton(skName, joints);
		};

		SkeletonLoader.prototype._createSkeletonPose = function (skeleton) {
			var pose = new SkeletonPose(skeleton);
			pose.setToBindPose();
			return pose;
		};

		return SkeletonLoader;
	}
);