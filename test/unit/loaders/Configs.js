var EntityConfig = require('./helpers/EntityConfig');
var AnimationConfig = require('./helpers/AnimationConfig');
var MaterialConfig = require('./helpers/MaterialConfig');
var MeshConfig = require('./helpers/MeshConfig');
var SceneConfig = require('./helpers/SceneConfig');
var PosteffectsConfig = require('./helpers/PosteffectsConfig');

var bundle = {};
var Configs = {
	randomRef: function (type) {
		var hash = 'aaaabbbbaaaabbbbaaaabbbbaaaabbbb'.replace(/[ab]/g, function(a) {
			return ((Math.random() * 16) % 16 | 0).toString(16);
		});
		return hash + '.' + (type || '');
	},
	gooObject: function (type, name) {
		var config = {
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
		this.addToBundle(config);
		return config;
	},
	addToBundle: function (config, ref) {
		ref = ref || config.id;
		if (ref) {
			bundle[ref] = config;
		}
	},
	binary: function (size) {
		var arr = new Float32Array(size);
		for (var i = 0; i < size; i++) {
			arr[i] = i / size;
		}
		var ref = Configs.randomRef('bin');
		Configs.addToBundle(arr.buffer, ref);
		return ref;
	},
	get: function () {
		return bundle;
	}
};

function attach(attachee, attacher) {
	for (var key in attacher) {
		if (attacher[key] instanceof Function) {
			attachee[key] = attacher[key].bind(Configs);
		} else if (attacher[key] instanceof Object) {
			attachee[key] = attachee[key] || {};
			attach(attachee[key], attacher[key]);
		} else {
			attachee[key] = attacher[key];
		}
	}
}

attach(Configs, EntityConfig);
attach(Configs, AnimationConfig);
attach(Configs, MaterialConfig);
attach(Configs, MeshConfig);
attach(Configs, SceneConfig);
attach(Configs, PosteffectsConfig);
// for (var i = 0; i < arguments.length; i++) {
// 	attach(Configs, arguments[i]);
// }

module.exports = Configs;