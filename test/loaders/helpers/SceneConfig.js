define([
], function(
) {
	'use strict';

	return {
		scene: function(complex) {
			var entityRefs = [];
			var components = complex ? ['transform', 'meshRenderer', 'meshData', 'animation', 'camera', 'light']: [];
			for (var i = 0; i < 5; i++) {
				entityRefs.push(this.entity(components).id);
			}
			var scene = this.gooObject('scene', 'Dummy');
			scene.entityRefs = entityRefs;
			return scene;
		},
		project: function(complex) {
			var project = this.gooObject('project', 'Dummy');
			project.scenes = {};

			var scene;
			for (var i = 0; i < 3; i++) {
				scene = {
					sortValue: Math.random(),
					sceneRef: this.scene(complex).id
				};
				project.scenes[this.randomRef()] = scene;
			}
			project.mainSceneRef = scene.sceneRef;
			return project;
		}
	};
});