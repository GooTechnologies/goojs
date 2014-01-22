define([
	'goo/util/ObjectUtil'
], function(
	_
) {
	'use strict';
	var bundle = {};
	var Configs = {
		randomRef: function(type) {
			return Math.random().toString(16) + '.' + (type || '');
		},
		gooObject: function(type, name) {
			return {
				id: Configs.randomRef(type),
				name: name,
				license: 'CC0',
				orignalLicense: 'CC0',

				created: '2014-01-11T13:29:12+00:00',
				modified: '2014-01-11T13:29:12+00:00',

				public: true,
				owner: 'rickard',
				readonly: false,
				description: 'Test object',
				deleted: false,

				dataModelVersion: 2
			};
		},
		entity: function(components) {
			components = components || ['transform'];
			var entity = Configs.gooObject('entity', 'Dummy');
			entity.components = {};
			for (var i = 0; i < components.length; i++) {
				entity.components[components[i]] = Configs.component[components[i]]();
			}
			bundle[entity.id] = entity;
			return entity;
		},
		component: {
			transform: function(translation, rotation, scale) {
				translation = (translation) ? translation.slice() : [0,0,0];
				rotation = (rotation) ? rotation.slice() : [0,0,0];
				scale = (scale) ? scale.slice() : [1,1,1];

				return {
					translation: translation,
					rotation: rotation,
					scale: scale
				};
			},
			camera: function(aspect, lockedRatio, far, fov, near) {
				return {
					aspect: aspect || 1,
					lockedRatio: !!lockedRatio,
					far: far || 1000,
					fov: fov || 45,
					near: near || 1
				};
			},
			light: function(type, options) {
				var config = _.defaults({}, options, {
					type: type || 'PointLight',
					color: [1,1,1],
					intensity: 1,
					shadowCaster: false,
					specularIntensity: 1
				});
				if (type !== 'DirectionalLight') {
					config.range = config.range || 1000;
				}
				if (type === 'SpotLight') {
					config.angle = config.angle || 55;
				}
				if (config.shadowCaster) {
					config.shadowSettings = config.shadowSettings || {};
					_.defaults(config.shadowSettings, {
						type: 'Blur',
						projection: (config.type === 'DirectionalLight') ? 'Parallel' : 'Perspective',
						near: 1,
						far: 1000,
						resolution: [512, 512],
						upVector: [0,1,0],
						darkness: 0.5
					});
				}
				return config;
			}
		},
		attachChild: function(parent, child) {
			if (!parent.components.transform.childRefs) {
				parent.components.transform.childRefs = {};
			}
			var key = Configs.randomRef();
			parent.components.transform.childRefs[key] = child.id;
		},
		get: function() {
			return bundle;
		}
	};
	return Configs;
});