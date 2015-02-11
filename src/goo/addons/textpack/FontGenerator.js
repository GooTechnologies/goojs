define(function () {
	'use strict';

	// ---
	var con2d;

	function drawPoint(x, y) {
		con2d.fillRect(x - 1, y - 1, 3, 3);
	}

	function drawPath(points) {
		con2d.beginPath();
		con2d.moveTo(points[0].x, points[0].y);

		con2d.fillStyle = 'black';
		con2d.fillText(0, points[0].x, points[0].y);
		for (var i = 1; i < points.length; i++) {
			con2d.lineTo(points[i].x, points[i].y);
			con2d.fillText(i, points[i].x, points[i].y);
		}

		con2d.fillStyle = 'rgba(0, 0, 255, 0.3)';
		con2d.strokeStyle = 'red';
		con2d.stroke();
		con2d.fill();
	}
	// ---

	function serializeCommand(command) {
		// horrible code follows
		var str = command.type;

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

	function isClockwise(polygon) {
		var sum = 0;

		for (var i = 1; i < polygon.length; i++) {
			var p1 = polygon[i - 1];
			var p2 = polygon[i];

			sum += (p2.x - p1.x) * (p2.y - p1.y);
		}

		return sum >= 0;
	}

	/**
	 * Finds the closest points of two polygons
	 * @param polygon1
	 * @param polygon2
	 * @returns {{index1: number, index2: number}}
	 */
	function findClosestPoints(polygon1, polygon2) {
		var minDist = Infinity;
		var minIndex1 = -1;
		var minIndex2 = -1;

		for (var i = 0; i < polygon1.length; i++) {
			for (var j = 0; j < polygon2.length; j++) {
				var candidate = distance(polygon1[i], polygon2[j]);
				if (candidate < minDist) {
					minDist = candidate;
					minIndex1 = i;
					minIndex2 = j;
				}
			}
		}

		return { index1: minIndex1, index2: minIndex2 };
	}

	/**
	 * Rotate an array a supplied amount of positions
	 * @param array
	 * @param positions
	 * @returns {Array}
	 */
	function rotate(array, positions) {
		var rotated = [];
		for (var i = 0; i < array.length; i++) {
			var newIndex = (i + positions) % array.length;
			rotated.push(array[newIndex]);
		}
		return rotated;
	}

	var WIGGLE_EPSILON = 0.00001;
	function wiggle(point, towards) {
		var dx = point.x - towards.x;
		var dy = point.y - towards.y;
		return {
			x: point.x + dx * WIGGLE_EPSILON,
			y: point.y + dy * WIGGLE_EPSILON
		};
	}

	/**
	 * Concatenate 2 polygons in one and duplicate the ends of the arrays
	 * @param polygon1
	 * @param polygon2
	 * @returns {string}
	 */
	function specialConcat(polygon1, polygon2) {
		var wiggled1 = wiggle(polygon1[0], polygon1[1]);
		var wiggled2 = wiggle(polygon2[0], polygon2[1]);
		return polygon1.concat(wiggled1).concat(polygon2).concat(wiggled2);
	}

	/**
	 * Merge 2 polygons to get a new polygon
	 * @param polygon1
	 * @param polygon2
	 * @returns {string}
	 */
	function mergePolygons(polygon1, polygon2) {
		// this find closest approach is good only for neatly placed points (like we have)
		// you can fabricate a set of points for which the minimal distance will not yield a cut-free joining-line
		var closestPoints = findClosestPoints(polygon1, polygon2);

		var rotated1 = rotate(polygon1, closestPoints.index1);
		var rotated2 = rotate(polygon2, closestPoints.index2);

		var clockwise1 = isClockwise(rotated1);
		var clockwise2 = isClockwise(rotated2);

		if (!(clockwise1 ^ clockwise2)) {
			polygon2.reverse();
		}

		drawPath(rotated2); //
		drawPath(rotated1); //

		return specialConcat(rotated1, rotated2);
	}

	function meshFromGlyph(glyph, fontSize, options) {
		options = options || {};
		options.simplifyPaths = options.simplifyPaths !== false;
		options.stepLength = options.stepLength || 4;

		var path = glyph.getPath(0, 0, fontSize);
		var stringifiedPath = path.commands.map(serializeCommand).reduce(function (prev, cur) {
			return prev + cur;
		}, '');

		var points = getPathPoints(stringifiedPath, options.stepLength);

		var pointGroups = groupPoints(points, options.stepLength);

		// ---
		pointGroups.forEach(function (group, index) {
			con2d.fillStyle = 'rgb(' + (index * 30) + ', ' + (index * 80) + ', ' + (255 - index * 80) + ')';
			group.forEach(function (point) {
				drawPoint(point.x, point.y);
			});
			drawPath(group);
		});
		// ---

		if (options.simplifyPaths) {
			pointGroups = pointGroups.map(simplifyPath);
		}

		var surface = pointGroups[0];

		for (var i = 1; i < pointGroups.length; i++) {
			con2d.translate(250, 0); //
			surface = mergePolygons(surface, pointGroups[i]);
		}

		return {
			surface: surface,
			contours: pointGroups
		};
	}

	return {
		meshFromGlyph: meshFromGlyph,
		setCon2d: function (_con2d) { con2d = _con2d; }
	};
});