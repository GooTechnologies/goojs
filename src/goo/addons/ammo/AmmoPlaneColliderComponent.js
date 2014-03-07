define([
	'goo/entities/components/Component',
	'goo/shapes/Box',
	'goo/math/Vector3'
], function(
	Component,
	Box,
	Vector3
){
	function AmmoPlaneColliderComponent(settings){
		this.type = "AmmoColliderComponent";

		settings = settings || {};
		var e = this.normal = settings.normal || new Vector3(0,1,0);
		var c = this.planeConstant = (typeof settings.planeConstant!="undefined" ? settings.planeConstant : 0);

		/*
		// Automatically use half extents from mesh data components if they exist
		if(typeof(entity)!="undefined" && entity.meshDataComponent && entity.meshDataComponent.meshData) {
			var meshData = entity.meshDataComponent.meshData;
			if (meshData instanceof Box) {
				e.set_d(meshData.xExtent, meshData.yExtent, meshData.zExtent);
			}
		}
		*/

		// Create shape
		this.ammoShape = new Ammo.btStaticPlaneShape(new Ammo.btVector3(e.x, e.y, e.z),c);
	};
	AmmoPlaneColliderComponent.prototype = Object.create(Component.prototype);
	AmmoPlaneColliderComponent.constructor = AmmoPlaneColliderComponent;

	return AmmoPlaneColliderComponent;
});
