define([
	'goo/entities/components/Component'
], function(
	Component
){
	function AmmoSphereColliderComponent(settings){
		this.type = "AmmoColliderComponent";

		settings = settings || {};

		this.radius = settings.radius || 0.5;

		this.ammoShape = new Ammo.btSphereShape(this.radius);

		/*
		if(entity.meshDataComponent && entity.meshDataComponent.meshData) {
			var meshData = entity.meshDataComponent.meshData;
			if (meshData instanceof Sphere) {
				this.ammoShape = new Ammo.btSphereShape(meshData.radius);
			}
		}
		else{
			if(typeof radius !== 'undefined'){
				this.ammoShape = new Ammo.btSphereShape(radius);
			}
			else{
				this.ammoShape = new Ammo.btSphereShape(0.5);
			}
		}
		*/
	};
	AmmoSphereColliderComponent.prototype = Object.create(Component.prototype);
	AmmoSphereColliderComponent.constructor = AmmoSphereColliderComponent;

	return AmmoSphereColliderComponent;
});
