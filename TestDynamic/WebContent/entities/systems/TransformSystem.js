define([ 'entities/systems/System' ], function(System) {
	function TransformSystem() {
		System.call(this, 'TransformSystem', [ 'TransformComponent' ]);
	}

	TransformSystem.prototype = Object.create(System.prototype);

	TransformSystem.prototype.process = function(entities) {

	};

	return TransformSystem;
});