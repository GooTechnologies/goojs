define([
	//'goo/util/ObjectUtil'
], function(
	//_
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