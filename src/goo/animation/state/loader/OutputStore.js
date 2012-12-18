define(function () {
	"use strict";

	/**
	 * @name OutputStore
	 * @class Storage class for items created during Layer import.
	 */
	function OutputStore() {
		this._attachments = [];
		this._usedClipSources = {};
	}

	OutputStore.prototype.findAttachmentPoint = function (name) {
		for (var i = 0, max = this._attachments.length; i < max; i++) {
			var attach = this._attachments[i];
			if (name === attach.getName()) {
				return attach;
			}
		}
		return null;
	};

	return OutputStore;
});