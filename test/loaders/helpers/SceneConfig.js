define([
	'goo/util/ObjectUtil'
], function(
	_
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
		},
		skybox: function(type) {
			var config = this.gooObject('skybox', 'Dummy');
			if (type === 'sphere') {
				config.sphere = {
					enabled: true,
					sphereRef: this.texture().id
				};
			} else {
				config.box = {
					enabled: true,
					topRef: this.texture().id,
					bottomRef: this.texture().id,
					leftRef: this.texture().id,
					rightRef: this.texture().id,
					frontRef: this.texture().id,
					backRef: this.texture().id
				};
			}
			return config;
		},
		environment: function() {
			var config = this.gooObject('environment', 'Dummy');
			_.extend(config, {
				backgroundColor: [1,1,1],
				globalAmbient: [0.5,0.5,0.5],
				skyboxRef: this.skybox().id,
				fog: {
					enabled: true,
					color: [1,0,0],
					near: 1,
					far: 100
				},
				weather: {
					snow: {
						velocity: 10,
						rate: 2,
						enabled: true,
						height: 100
					}
				}
			});
			return config;
		}
	};
});