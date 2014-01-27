define([
], function(
) {
	'use strict';

	return {
		scene: function() {
			var entityRefs = [];
			for (var i = 0; i < 5; i++) {
				entityRefs.push(this.entity().id);
			}
			var scene = this.gooObject('scene', 'Dummy');
			scene.entityRefs = entityRefs;
			return scene;
		}
	};
});