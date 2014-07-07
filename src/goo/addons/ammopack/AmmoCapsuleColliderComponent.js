define([
	'goo/entities/components/Component'
], function(
	Component
){
	function AmmoCapsuleColliderComponent(entity, radius, height){
		this.type = "AmmoColliderComponent";
		this.radius = typeof radius !== 'undefined' ? radius : 0.5;
		this.height = typeof height !== 'undefined' ? height : 0.0;

		this.ammoShape = new Ammo.btCapsuleShape(this.radius, this.height);
	};
	AmmoCapsuleColliderComponent.prototype = Object.create(Component.prototype);
	AmmoCapsuleColliderComponent.constructor = AmmoCapsuleColliderComponent;

	return AmmoCapsuleColliderComponent;
});
