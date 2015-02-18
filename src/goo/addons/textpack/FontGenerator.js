define([
	'goo/math/Vector2',
	'goo/math/Transform',
	'goo/util/MeshBuilder',
	'goo/geometrypack/FilledPolygon',
	'goo/geometrypack/PolyLine'
], function (
	Vector2,
	Transform,
	MeshBuilder,
	FilledPolygon,
	PolyLine
) {
	'use strict';

	function serializeCommand(command) {
		// horrible code follows
		var str = command.type;

		// a check for xs should be enough?
		if (command.x2 !== undefined) { str += ' ' + command.x2; }
		if (command.y2 !== undefined) { str += ' ' + command.y2; }

		if (command.x1 !== undefined) { str += ' ' + command.x1; }
		if (command.y1 !== undefined) { str += ' ' + command.y1; }

		if (command.x !== undefined) { str += ' ' + command.x; }
		if (command.y !== undefined) { str += ' ' + command.y; }

		return str;
	}

	function getPathPoints(stringifiedPath, stepLength) {
		var svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		svgPath.setAttribute('d', stringifiedPath);

		var pathLength = svgPath.getTotalLength();

		var points = [];
		for (var i = 0; i < pathLength; i += stepLength) {
			var point = svgPath.getPointAtLength(i);
			points.push({ x: point.x, y: point.y });
		}

		return points;
	}

	function distance(point1, point2) {
		return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
	}

	/**
	 * Group points by the distance between them
	 * @param {{ x: number, y: number}[]} points
	 * @param {number} stepLength
	 * @returns {Array}
	 */
	function groupPoints(points, stepLength) {
		var groups = [];

		var group = [];
		group.push(points[0]);
		for (var i = 1; i < points.length; i++) {
			var p1 = points[i - 1];
			var p2 = points[i];

			var latestDistance = distance(p1, p2);

			if (latestDistance > (stepLength + 0.1)) {
				groups.push(group);
				group = [];
			}

			group.push(p2);
		}

		groups.push(group);
		return groups;
	}

	var ANGLE_THRESHOLD = 0.001;
	function simplifyPath(polygon) {
		var simplePolygon = [];

		simplePolygon.push(polygon[0]);
		for (var i = 1; i < polygon.length - 1; i++) {
			var deltaX1 = polygon[i - 1].x - polygon[i].x;
			var deltaY1 = polygon[i - 1].y - polygon[i].y;

			var deltaX2 = polygon[i].x - polygon[i + 1].x;
			var deltaY2 = polygon[i].y - polygon[i + 1].y;

			// can do only one arctan per point
			var angle1 = Math.atan2(deltaY1, deltaX1);
			var angle2 = Math.atan2(deltaY2, deltaX2);

			if (Math.abs(angle1 - angle2) > ANGLE_THRESHOLD) {
				simplePolygon.push(polygon[i]);
			}
		}
		simplePolygon.push(polygon[i]);

		return simplePolygon;
	}

	function getBoundingVolume(polygon) {
		var min = new Vector2(polygon[0].x, polygon[0].y);
		var max = min.clone();

		for (var i = 1; i < polygon.length; i++) {
			var point = polygon[i];

			if (point.x < min.x) {
				min.x = point.x;
			} else if (point.x > max.x) {
				max.x = point.x;
			}

			if (point.y < min.y) {
				min.y = point.y;
			} else if (point.y > max.y) {
				max.y = point.y;
			}
		}

		return {
			min: min,
			max: max
		};
	}

	function containsBox(a, b) {
		return a.min.x < b.min.x && a.max.x > b.max.x &&
			a.min.y < b.min.y && a.max.y > b.max.y;
	}

	function getHierarchy(polygons) {
		// most characters have 1 polygon
		// a, b, d, e, i... have 2 polygons
		// 8, B have 3 polygons
		// % has 5 polygons
		// capital `theta` in the greek alphabet has 3 polygons, all nested
		var candidates = polygons.map(function (polygon) {
			return {
				polygon: polygon,
				boundingVolume: getBoundingVolume(polygon),
				parent: null,
				children: []
			};
		});

		for (var i = 0; i < candidates.length; i++) {
			var candidateParent = candidates[i];
			for (var j = 0; j < candidates.length; j++) {
				var candidateChild = candidates[j];

				if (containsBox(candidateParent.boundingVolume, candidateChild.boundingVolume)) {
					candidateParent.children.push(candidateChild);
					candidateChild.parent = candidateParent;
				}
			}
		}

		var contours = candidates.filter(function (candidate) {
			return !candidate.parent;
		});

		contours.forEach(function (contour) {
			contour.children.forEach(function (child) {
				Array.prototype.push.apply(contours, child.children);
			});
		});

		return contours.map(function (candidate) {
			return {
				polygon: candidate.polygon,
				holes: candidate.children
			};
		});
	}

	function addIndices(polygons) {
		var counter = 0;
		polygons.forEach(function (points) {
			points.forEach(function (point) {
				point._index = counter;
				counter++;
			});
		});
	}

	function getIndices(triangles) {
		var indices = [];
		triangles.forEach(function (triangle) {
			indices.push(
				triangle.getPoint(0)._index,
				triangle.getPoint(1)._index,
				triangle.getPoint(2)._index
			);
		});
		return indices;
	}

	function getVerts(points) {
		// use an inverse map from indices to _indices
		points.sort(function (a, b) { return a._index - b._index; });

		var verts = [];
		points.forEach(function (point) {
			verts.push(point.x, point.y, 0);
		});
		return verts;
	}

	function triangulate(contour, holes) {
		var swctx = new poly2tri.SweepContext(contour.slice(0));
		holes.forEach(function (hole) { swctx.addHole(hole.polygon.slice(0)); });

		swctx.triangulate();
		var triangles = swctx.getTriangles();

		return getIndices(triangles);
	}

	/**
	 * Constructs the vertex data, index data and extrusions for a glyph
	 * @param glyph
	 * @param {number} fontSize
	 * @param {Object} options
	 * @param {boolean} [options.simplifyPaths=true]
	 * @param {number} [options.stepLength=10]
	 * @param {number} [options.fontSize=48]
	 * @returns {{surfaceIndices: Array, surfaceVerts: Array, extrusions: Array}}
	 */
	function dataForGlyph(glyph, options) {
		options = options || {};
		options.simplifyPaths = options.simplifyPaths !== false;

		var path = glyph.getPath(0, 0, options.fontSize);
		var stringifiedPath = path.commands.map(serializeCommand).reduce(function (prev, cur) {
			return prev + cur;
		}, '');

		var points = getPathPoints(stringifiedPath, options.stepLength);

		var polygons = groupPoints(points, options.stepLength);

		if (options.simplifyPaths) {
			polygons = polygons.map(simplifyPath);
		}

		addIndices(polygons);

		var hierarchy = getHierarchy(polygons);

		// gather the vertices of all polygons
		var surfaceVerts = [];
		polygons.forEach(function (polygon) {
			var verts = getVerts(polygon);
			Array.prototype.push.apply(surfaceVerts, verts);
		});

		// separate contours need separate triangulations
		var surfaceIndices = [];
		hierarchy.forEach(function (contour) {
			var indices = triangulate(contour.polygon, contour.holes);
			Array.prototype.push.apply(surfaceIndices, indices);
		});

		return {
			surfaceIndices: surfaceIndices,
			surfaceVerts: surfaceVerts,
			extrusions: polygons
		};
	}

	function meshesForText(text, font, options) {
		options = options || {};
		options.extrusion = options.extrusion !== undefined ? options.extrusion : 4;
		options.merge = options.merge !== false;
		options.stepLength = options.stepLength || 1;
		options.fontSize = options.fontSize || 48;

		var meshBuilder = new MeshBuilder();

		function meshForGlyph(data, x, y, options) {
			function frontFace() {
				var meshData = new FilledPolygon(data.surfaceVerts, data.surfaceIndices);
				var transform = new Transform();
				transform.translation.setDirect(x, y, options.extrusion / 2);
				transform.scale.setDirect(1, -1, 1);
				transform.update();
				meshBuilder.addMeshData(meshData, transform);
			}

			function backFace() {
				var meshData = new FilledPolygon(data.surfaceVerts, data.surfaceIndices);
				var transform = new Transform();
				transform.translation.setDirect(x, y, -options.extrusion / 2);
				transform.scale.setDirect(1, -1, 1);
				transform.update();
				meshBuilder.addMeshData(meshData, transform);
			}

			frontFace();
			backFace();

			data.extrusions.forEach(function (polygon) {
				var contourVerts = getVerts(polygon);
				contourVerts.push(contourVerts[0], contourVerts[1], contourVerts[2]);

				var contourPolyLine = new PolyLine(contourVerts, true);
				var extrusionPolyLine = new PolyLine([0, 0, -options.extrusion / 2, 0, 0, options.extrusion / 2]);
				var meshData = contourPolyLine.mul(extrusionPolyLine);

				var transform = new Transform();
				transform.translation.setDirect(x, 0, 0);
				transform.scale.setDirect(1, -1, 1);
				transform.update();

				meshBuilder.addMeshData(meshData, transform);
			});
		}

		font.forEachGlyph(text, 0, 0, options.fontSize, {}, function (glyph, x, y, fontSize, _options) {
			if (glyph.path.commands.length > 0) {
				var data = dataForGlyph(glyph, options);

				meshForGlyph(data, x, y, options);
			}
		});

		return meshBuilder.build();
	}

	return {
		meshesForText: meshesForText
	};
});