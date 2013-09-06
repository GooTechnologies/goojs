define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/MeshDataComponent',
	'goo/renderer/bounds/BoundingBox',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil'
], function(
	ComponentHandler,
	MeshDataComponent,
	BoundingBox,
	RSVP,
	pu,
	_
) {
	function MeshDataComponentHandler() {
		ComponentHandler.apply(this, arguments);
	}

	MeshDataComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	ComponentHandler._registerClass('meshData', MeshDataComponentHandler);

	MeshDataComponentHandler.prototype._prepare = function(config) {
		return _.defaults(config, {
			meshRef: null
		});
	};

	MeshDataComponentHandler.prototype._create = function(/*entity, config*/) {};

	MeshDataComponentHandler.prototype.update = function(entity, config) {
		var that = this;
		var p1, p2;
		ComponentHandler.prototype.update.call(this, entity, config);

		var meshRef = config.meshRef;
		if (!meshRef) {
			console.error("No meshRef in meshDataComponent for " + entity.ref);
		}
		var poseRef = config.poseRef || config.pose;
		if (poseRef) {
			p1 = this.getConfig(poseRef).then(function(poseConfig) {
				return that.updateObject(poseRef, poseConfig);
			});
		} else {
			p1 = pu.createDummyPromise();
		}
		p2 = this.getConfig(meshRef).then(function(config) {
			return that.updateObject(meshRef, config);
		});
		return RSVP.all([p1, p2]).then(function(argumentArray) {
			var skeletonPose = argumentArray[0];
			var meshData = argumentArray[1];
			var component = new MeshDataComponent(meshData);

			if (meshData.boundingBox) {
				var min = meshData.boundingBox.min;
				var max = meshData.boundingBox.max;
				var size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
				var center = [(max[0] + min[0]) * 0.5, (max[1] + min[1]) * 0.5, (max[2] + min[2]) * 0.5];
				var bounding = new BoundingBox();
				bounding.xExtent = size[0];
				bounding.yExtent = size[1];
				bounding.zExtent = size[2];
				bounding.center.seta(center);
				component.modelBound = bounding;
				component.autoCompute = false;
			}
			if (skeletonPose) {
				component.currentPose = skeletonPose;
			}
			entity.setComponent(component);
			return component;
		});
	};

	return MeshDataComponentHandler;
});
