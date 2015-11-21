var Edge = require('../../renderer/scanline/Edge');

	'use strict';

	/**
	 * Stores the edges to render.
	 * @param {Number} edgeCount The number of edges needed during runtime
	 * @constructor
	 */
	function EdgeMap(edgeCount) {
		this._edges = new Array(edgeCount);
		this._edgeCount = 0;
		for (var e = 0; e < edgeCount; e++) {
			this._edges[e] = new Edge();
		}

		this._map = {};

		// TODO : Remove this member variable. ( DEBUG)
		this.numberOfSharedEdges = 0;
	}

	EdgeMap.prototype.addEdge = function (i1, i2, vec1, vec2) {
		var key1 = this._indicesToKey(i1, i2);
		if (!this._contains(key1)) {
			var key2 = this._indicesToKey(i2, i1);

			var edgeIndex = this._edgeCount;
			var edge = this._edges[edgeIndex];

			edge.setData(vec1, vec2, i1, i2);
			edge.computeDerivedData();

			this._map[key1.toString()] = edgeIndex;
			this._map[key2.toString()] = edgeIndex;

			this._edgeCount++;
		} else {
			// The edge already exists, set the edge to be between faces.
			var edgeIndex = this._map[key1];
			this._edges[edgeIndex].betweenFaces = true;
			this.numberOfSharedEdges++;
		}
	};

	EdgeMap.prototype._contains = function (mapIndex) {
		return this._map.hasOwnProperty(mapIndex);
	};

	EdgeMap.prototype.getEdge = function (i1, i2) {
		var index = this._indicesToKey(i1, i2);
		var edgeIndex = this._map[index];
		return this._edges[edgeIndex];
	};

	EdgeMap.prototype.clear = function () {
		this._map = {};
		this._edgeCount = 0;
		this.numberOfSharedEdges = 0;
	};

	/*jshint bitwise: false */
	EdgeMap.prototype._indicesToKey = function (i1, i2) {
		return (i1 << 8) + i2;
	};
	/*jshint bitwise: true*/

	module.exports = EdgeMap;
