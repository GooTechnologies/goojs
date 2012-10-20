"use strict";

define([ 'goo/renderer/Util', 'goo/renderer/MeshData' ], function(Util, MeshData) {
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
	createDefault(MeshData.POSITION, 3, 'Float');
	createDefault(MeshData.NORMAL, 3, 'Float');
	createDefault(MeshData.COLOR, 4, 'Float');
	createDefault(MeshData.TEXCOORD0, 2, 'Float');

	function createDefault(attributeName, count, type) {
		defaults[attributeName] = {
			attributeName : attributeName,
			count : count,
			type : type
		};
		// DataMap.createDescriptor(attributeName, count, type);
	}

	DataMap.createDescriptor = function(attributeName, count, type) {
		return {
			attributeName : attributeName,
			count : count,
			type : type
		};
	};

	function buildMap(types) {
		var builder = DataMap.builder();
		for ( var i in types) {
			var type = types[i];
			builder.add(defaults[type]);
		}
		return builder.build();
	}

	DataMap.defaultMap = function(types) {
		if (types === undefined) {
			return buildMap(Object.keys(defaults));
		} else {
			return buildMap(types);
		}
	};

	return DataMap;
});