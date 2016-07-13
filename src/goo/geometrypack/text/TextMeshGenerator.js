/* global poly2tri */

var Vector2 = require('../../math/Vector2');
var Transform = require('../../math/Transform');
var MeshBuilder = require('../../util/MeshBuilder');
var FilledPolygon = require('../../geometrypack/FilledPolygon');
var PolyLine = require('../../geometrypack/PolyLine');

/**
 * Serializes an svg path command
 * @param {Object} command
 * @returns {string}
 */
function serializeCommand(command) {
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

/**
 * Computes a cloud of points from an svg path
 * @param {string} serializedPath
 * @param {number} stepLength Lower values result in more detail
 * @returns {Array<{ x: number, y: number }>} Aa array of point-like objects
 */
function getPathPoints(serializedPath, stepLength) {
	var svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	svgPath.setAttribute('d', serializedPath);

	var pathLength = svgPath.getTotalLength();

	var points = [];
	for (var i = 0; i < pathLength; i += stepLength) {
		var point = svgPath.getPointAtLength(i);
		points.push({ x: point.x, y: point.y });
	}

	return points;
}

/**
 * Computes the distance between 2 points
 * @param {{ x: number, y: number }} point1
 * @param {{ x: number, y: number }} point2
 * @returns {number}
 */
function distance(point1, point2) {
	return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

/**
 * Isolates separate polygons by the distance between points
 * @param {Array<{ x: number, y: number }>} points
 * @param {number} stepLength
 * @returns {Array<Array<{ x: number, y: number }>>}
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

/**
 * Simplifies a polygon by collapsing collinear adjacent points
 * @param {Array<{ x: number, y: number }>} polygon
 * @returns {Array<{ x: number, y: number }>}
 */
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

/**
 * Computes the 2D bounding box of a poygon
 * @param {Array<{ x: number, y: number }>} polygon
 * @returns {{ min: Vector2, max: Vector2 }}
 */
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

/**
 * Checks whether a bounding box is contained within another bounding box
 * @param a
 * @param b
 * @returns {boolean}
 */
function containsBox(a, b) {
	return a.min.x < b.min.x && a.max.x > b.max.x &&
		a.min.y < b.min.y && a.max.y > b.max.y;
}

function mergeBoxes(a, b) {
	return {
		min: new Vector2(Math.min(a.min.x, b.min.x), Math.min(a.min.y, b.min.y)),
		max: new Vector2(Math.max(a.max.x, b.max.x), Math.max(a.max.y, b.max.y))
	};
}

/**
 * Groups polygons in contours with holes
 * @param {Array<{ x: number, y: number }>} polygons
 * @returns {{ polygon, holes }}
 */
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

	var totalBounds = candidates[0].boundingVolume;
	for (var i = 1; i < candidates.length; i++) {
		var contour = candidates[i];
		totalBounds = mergeBoxes(totalBounds, contour.boundingVolume);
	}

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

	return {
		topLevel: contours.map(function (candidate) {
			return {
				polygon: candidate.polygon,
				holes: candidate.children
			};
		}),
		boundingVolume: totalBounds
	};
}

function invertWinding(array) {
	var inverted = new Array(array.length);
	for (var i = 0; i < array.length; i += 3) {
		inverted[i + 0] = array[i + 0];
		inverted[i + 1] = array[i + 2];
		inverted[i + 2] = array[i + 1];
	}
	return inverted;
}

/**
 * Adds indices to the vertices of a polygon
 * @param polygons
 */
function addIndices(polygons) {
	var counter = 0;
	polygons.forEach(function (points) {
		points.forEach(function (point) {
			point._index = counter;
			counter++;
		});
	});
}

/**
 * Extracts the indices of a triangulation computed by the triangulation library
 * @param triangles
 * @returns {Array}
 */
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

/**
 * Flattens an array of points defined as objects { x, y } into an array
 * @param {Array<{ x: number, y: number }>} points
 * @returns {Array<number>}
 */
function getVerts(points) {
	// use an inverse map from indices to _indices
	points.sort(function (a, b) { return a._index - b._index; });

	var verts = [];
	points.forEach(function (point) {
		verts.push(point.x, point.y, 0);
	});
	return verts;
}

/**
 * Forwards a contour polygon with optional holes to the triangulation library and processes the results
 * @param contour
 * @param holes
 * @returns {*}
 */
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
 * @param {Object} options
 * @param {boolean} [options.simplifyPaths=true] Disable to get evenly spaced tessellations on the edges
 * @param {number} [options.fontSize=48]
 * @param {number} [options.stepLength=1] Lower values result in a more detailed mesh
 * @returns {{surfaceIndices: Array, surfaceVerts: Array, extrusions: Array}}
 */
function dataForGlyph(glyph, options) {
	options = options || {};
	options.simplifyPaths = options.simplifyPaths !== false;

	var path = glyph.getPath(0, 0, options.fontSize);
	var serializedPath = path.commands.map(serializeCommand).reduce(function (prev, cur) {
		return prev + cur;
	}, '');

	var points = getPathPoints(serializedPath, options.stepLength);

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
	hierarchy.topLevel.forEach(function (contour) {
		var indices = triangulate(contour.polygon, contour.holes);
		Array.prototype.push.apply(surfaceIndices, indices);
	});

	return {
		surfaceIndices: surfaceIndices,
		surfaceVerts: surfaceVerts,
		extrusions: polygons,
		boundingVolume: hierarchy.boundingVolume
	};
}

/**
 * Builds meshes from a font
 * @param {string} text
 * @param font
 * @param {Object} [options]
 * @param {number} [options.extrusion=4] Extrusion amount
 * @param {number} [options.fontSize=48]
 * @param {number} [options.stepLength=1] Lower values result in a more detailed mesh
 * @param {bool}   [options.backface=true] If text should be backfaced
 * @returns {Array<MeshData>}
 */
function meshesForText(text, font, options) {
	options = options || {};
	options.backface = options.backface !== undefined ? options.backface : true;
	options.extrusion = options.extrusion !== undefined ? options.extrusion : 4;
	options.stepLength = options.stepLength || 1;
	options.fontSize = options.fontSize || 48;


	var dataSets = [];
	font.forEachGlyph(text, 0, 0, options.fontSize, {}, function (glyph, x, y) {
		if (glyph.path.commands.length > 0) {
			dataSets.push({
				data: dataForGlyph(glyph, options),
				x: x,
				y: y
			});
		}
	});


	var meshBuilder = new MeshBuilder();

	function meshForGlyph(data, x, y, options) {
		function frontFace() {
			var meshData = new FilledPolygon(data.surfaceVerts, data.surfaceIndices);
			var transform = new Transform();
			transform.translation.setDirect(x, y, -options.extrusion / 2);
			transform.scale.setDirect(1, -1, 1);
			transform.update();
			meshBuilder.addMeshData(meshData, transform);
		}
	
		function backFace() {
			var meshData = new FilledPolygon(data.surfaceVerts, invertWinding(data.surfaceIndices));
			var transform = new Transform();
			transform.translation.setDirect(x, y, options.extrusion / 2);
			transform.scale.setDirect(1, -1, 1);
			transform.update();
			meshBuilder.addMeshData(meshData, transform);
		}
	
		if (options.backface) {
			frontFace();
		} else { // If the back face shouldn't be visible, set extrusion to 0s
			options.extrusion = 0;
		}
      		backFace();

		if (options.extrusion) {
			data.extrusions.forEach(function (polygon) {
				var contourVerts = getVerts(polygon);
				contourVerts.push(contourVerts[0], contourVerts[1], contourVerts[2]);
	
				var contourPolyLine = new PolyLine(contourVerts, true);
				var extrusionPolyLine = new PolyLine([0, 0, -options.extrusion / 2, 0, 0, options.extrusion / 2]);
				var meshData = contourPolyLine.mul(extrusionPolyLine);
	
				var transform = new Transform();
				transform.translation.setDirect(x, y, 0);
				transform.scale.setDirect(1, -1, -1);
				transform.update();
	
				meshBuilder.addMeshData(meshData, transform);
			});
		}
	}


	// get the total bounds; it's enough to merge the first and last chars
	var firstDataSet = dataSets[0];
	var minX = firstDataSet.data.boundingVolume.min.x;

	var lastDataSet = dataSets[dataSets.length - 1];
	var maxX = lastDataSet.data.boundingVolume.max.x + lastDataSet.x;

	// compute the offset needed for centering
	var offsetX = (minX + maxX) / 2;

	// add the mesh
	dataSets.forEach(function (dataSet) {
		meshForGlyph(dataSet.data, dataSet.x - offsetX, 0, options);
	});

	return meshBuilder.build();
}

module.exports = {
	meshesForText: meshesForText
};
