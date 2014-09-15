define([
	'goo/math/Vector2',
	'goo/math/Vector3',
	'goo/renderer/MeshData'
	],
/** @lends */
function (
	Vector2,
	Vector3,
	MeshData
) {
	'use strict';

	/**
	 * @class The purpose of this class is to hold additional information regarding a typedarray buffer, like vbo 'usage' flags
	 * @param {String} target Type of data ('ArrayBuffer'/'ElementArrayBuffer')
	 * @property {String} target Type of data ('ArrayBuffer'/'ElementArrayBuffer')
	 */
	function TangentGenerator() {
	}

	TangentGenerator.addTangentBuffer = function (meshData, uvUnit) {
		uvUnit = uvUnit || 0;

		var vertexBuffer = meshData.getAttributeBuffer(MeshData.POSITION);
		if (!vertexBuffer) {
			// console.warn("Vertex buffer is null!");
			return;
		}

		var normalBuffer = meshData.getAttributeBuffer(MeshData.NORMAL);
		if (!normalBuffer) {
			// console.warn("Normal buffer is null!");
			return;
		}

		var textureBuffer = meshData.getAttributeBuffer('TEXCOORD' + uvUnit);
		if (!textureBuffer && uvUnit !== 0) {
			textureBuffer = meshData.getAttributeBuffer(MeshData.TEXCOORD0);
		}
		if (!textureBuffer) {
			// console.warn("Texture buffer is null!");
			return;
		}

		var indexBuffer = meshData.getIndexBuffer();
		if (!indexBuffer) {
			// console.warn("Index buffer is null!");
			return;
		}

		var vertexCount = meshData.vertexCount;
		var triangleCount = meshData.indexCount / 3; // TODO: Handle other primitives than triangles

		var tan1 = [];
		var tan2 = [];
		for (var i = 0; i < vertexCount; i++) {
			tan1[i] = new Vector3();
			tan2[i] = new Vector3();
		}

		function getVector2Array (buf) {
			var arr = [];
			for (var i = 0; i < buf.length; i += 2) {
				arr.push(new Vector2(buf[i + 0], buf[i + 1]));
			}
			return arr;
		}
		function getVector3Array (buf) {
			var arr = [];
			for (var i = 0; i < buf.length; i += 3) {
				arr.push(new Vector3(buf[i + 0], buf[i + 1], buf[i + 2]));
			}
			return arr;
		}

		var vertex = getVector3Array(vertexBuffer);
		var normal = getVector3Array(normalBuffer);
		var texcoord = getVector2Array(textureBuffer);

		for (var a = 0; a < triangleCount; a++) {
			var i1 = indexBuffer[a * 3];
			var i2 = indexBuffer[a * 3 + 1];
			var i3 = indexBuffer[a * 3 + 2];

			var v1 = vertex[i1];
			var v2 = vertex[i2];
			var v3 = vertex[i3];

			var w1 = texcoord[i1];
			var w2 = texcoord[i2];
			var w3 = texcoord[i3];

			var x1 = v2.x - v1.x;
			var x2 = v3.x - v1.x;
			var y1 = v2.y - v1.y;
			var y2 = v3.y - v1.y;
			var z1 = v2.z - v1.z;
			var z2 = v3.z - v1.z;

			var s1 = w2.x - w1.x;
			var s2 = w3.x - w1.x;
			var t1 = w2.y - w1.y;
			var t2 = w3.y - w1.y;

			var r = 1.0 / (s1 * t2 - s2 * t1);
			if (isFinite(r) === false) {
				continue;
			}
			var sdir = new Vector3((t2 * x1 - t1 * x2) * r, (t2 * y1 - t1 * y2) * r, (t2 * z1 - t1 * z2) * r);
			var tdir = new Vector3((s1 * x2 - s2 * x1) * r, (s1 * y2 - s2 * y1) * r, (s1 * z2 - s2 * z1) * r);

			tan1[i1].add(sdir);
			tan1[i2].add(sdir);
			tan1[i3].add(sdir);

			tan2[i1].add(tdir);
			tan2[i2].add(tdir);
			tan2[i3].add(tdir);
		}

		meshData.attributeMap[MeshData.TANGENT] = MeshData.createAttribute(4, 'Float');
		meshData.rebuildData(meshData.vertexCount, meshData.indexCount, true);
		var tangentBuffer = meshData.getAttributeBuffer(MeshData.TANGENT);

		var calc1 = new Vector3();
		var calc2 = new Vector3();
		for (var a = 0; a < vertexCount; a++) {
			var n = normal[a];
			var t = tan1[a];

			// Gram-Schmidt orthogonalize
			var dot = n.dot(t);
			calc1.copy(t).sub(calc2.copy(n).mul(dot)).normalize();
			tangentBuffer[a * 4 + 0] = calc1.x;
			tangentBuffer[a * 4 + 1] = calc1.y;
			tangentBuffer[a * 4 + 2] = calc1.z;

			// Calculate handedness
			dot = calc1.copy(n).cross(t).dot(tan2[a]);
			var w = dot < 0.0 ? -1.0 : 1.0;
			tangentBuffer[a * 4 + 3] = w;
		}

		return tangentBuffer;
	};

	return TangentGenerator;
});