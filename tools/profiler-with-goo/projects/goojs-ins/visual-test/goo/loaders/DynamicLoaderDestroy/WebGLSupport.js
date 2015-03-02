define([
], function(
) {

	'use strict';

	var WebGLSupport = {
		ERRORS: {
			NO_ERROR: 'no error',
			NO_RENDERING_CONTEXT: 'noRenderingContext',
			WEBGL_DISABLED: 'webglDisabled'
		},

		BROWSERS: {
			CHROME: 'chrome',
			FIREFOX: 'firefox',
			OPERA: 'opera',
			IOS: 'ios',
			IE: 'ie',
			LUDEI: 'ludei',
			SAFARI: 'safari'
		},

		/*
		* Checks for a present webgl rendering context and if webgl is
		* disabled.
		*
		* The client's browser is checked and returned as well.
		*/
		check: function() {

			var result = {
				error: null,
				browser: null
			};

			result.browser = this.getBrowser();

			if (!window.WebGLRenderingContext) {
				result.error = this.ERRORS.NO_RENDERING_CONTEXT;
			} else if (isWebGLDisabled() === true) {
				result.error = this.ERRORS.WEBGL_DISABLED;
			} else {
				result.error = this.ERRORS.NO_ERROR;
			}

			return result;
		},

		getBrowser: function() {

			var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
			var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
			var isChrome = !!window.chrome;
			var isFirefox = typeof InstallTrigger !== 'undefined';
			var isSafari =  navigator.userAgent.indexOf('Safari') >= 0;
			var isIE = document.documentMode || false;
			var isCocoonJS = navigator.appName === "Ludei CocoonJS";

			if (!(isFirefox || isChrome)) {
				console.warn('Chrome or Firefox will generally work better with Goo.');
			}

			var browser = null;

			if (iOS === true) {
				browser = this.BROWSERS.IOS;
			} else if (isOpera === true) {
				browser = this.BROWSERS.OPERA;
			} else if (isChrome === true) {
				browser = this.BROWSERS.CHROME;
			} else if (isFirefox === true) {
				browser = this.BROWSERS.FIREFOX;
			} else if (isSafari === true) {
				browser = this.BROWSERS.SAFARI;
			} else if (isIE === true) {
				browser = this.BROWSERS.IE;
			} else if (isCocoonJS === true) {
				browser = this.BROWSERS.LUDEI;
			} else {
				console.warn('Browser was not determined!');
			}

			return browser;
		}

	};

	function isWebGLDisabled() {
		var gl = null;
		var canvas = document.createElement('canvas');

		try {
			gl = canvas.getContext('webgl');
		}
		catch (_error) {
			console.error(_error);
			gl = null;
		}

		if (gl === null) {
			try {
				gl = canvas.getContext('experimental-webgl');
			}
			catch (_error) {
				console.error(_error);
				gl = null;
			}
		}

		if (gl === null && window.WebGLRenderingContext) {
			return true;
		} else {
			return false;
		}
	};

	return WebGLSupport;
});