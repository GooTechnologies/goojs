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

	// polygons -> { contour: polygon, holes: polygon[] }[]
	function getHolesAndContour(polygons) {
		// this will have to do for now
		polygons.sort(function (a, b) { return b.length - a.length; });
		return {
			contour: polygons[0],
			holes: polygons.slice(1)
		};
	}

	function printIndices(points) {
		var str = points.map(function (point) { return point._index; }).join(', ');
		console.log(str);
	}

	function convert(holesAndContour) {
		var indexCounter = 0;

		function convert(polygon) {
			polygon.forEach(function (point) {
				point._index = indexCounter;
				indexCounter++;
				console.log(indexCounter);
			});
		}

		convert(holesAndContour.contour);
		holesAndContour.holes.forEach(convert);
	}

	function meshFromGlyph(glyph, fontSize, options) {
		options = options || {};
		options.simplifyPaths = options.simplifyPaths !== false;
		options.stepLength = options.stepLength || 20;

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

		var holesAndContour = getHolesAndContour(pointGroups);

		convert(holesAndContour);

		console.log('contour length', holesAndContour.contour.length);
		holesAndContour.holes.forEach(function (group, index) {
			console.log('hole', index, 'length', group.length);
		});

		return holesAndContour;
	}

	return {
		meshFromGlyph: meshFromGlyph,
		setCon2d: function (_con2d) { con2d = _con2d; }
	};
});