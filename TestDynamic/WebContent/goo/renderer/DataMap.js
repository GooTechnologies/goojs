define([ 'goo/renderer/Util' ], function(Util) {
	function DataMap() {

	}

	DataMap.builder = function() {
		var vertexByteSize = 0;
		var descriptors = {};
		return {
			add : function(descriptor) {
				descriptor.offset = descriptor.offset | 0;
				descriptor.stride = descriptor.stride | 0;
				descriptor.normalized = descriptor.normalized | true;
				descriptors[descriptor.attributeName] = descriptor;
				vertexByteSize += Util.getByteSize(descriptor.type) * descriptor.count;
				return this;
			},
			build : function() {
				return {
					vertexByteSize : vertexByteSize,
					descriptors : descriptors
				};
			}
		};
	};

	var defaults = {};
	createDefault('POSITION', 3, 'Float');
	createDefault('NORMAL', 3, 'Float');
	createDefault('COLOR', 4, 'Float');
	createDefault('TEXCOORD0', 2, 'Float');

	function createDefault(attributeName, count, type) {
		defaults[attributeName] = {
			attributeName : attributeName,
			count : count,
			type : type
		};
	}

	function buildMap(types) {
		var builder = DataMap.builder();
		for (i in types) {
			var type = types[i];
			builder.add(defaults[type]);
		}
		return builder.build();
	}

	DataMap.defaultMap = function(types) {
		if (types == undefined) {
			return buildMap(Object.keys(defaults));
		} else {
			return buildMap(types);
		}
	};

	return DataMap;
});