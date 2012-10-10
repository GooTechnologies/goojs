define(function() {
	function TransformSystem() {
		this.type = 'TransformSystem';
		this.interests = [ 'TransformComponent' ];
	}

	TransformSystem.prototype.process = function(entities) {
		for (i in entities) {
			var entity = entities[i];

		}
	};

	return TransformSystem;
});