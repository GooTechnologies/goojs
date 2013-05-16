define([
	'goo/util/Logo'
],
/** lends */
function(Logo) {
	'use strict';

	/**
	 * @class Some templates to display messages when there is no WebGL support.
	 * @description Only used to define the class. Should never be instantiated.
	 * @param {string} [template] The name of the template to show when WebGL support is missing.
	 */
	function NoWebGL(template) {
		if (NoWebGL.templates[template]) {
			this.template = NoWebGL.templates[template];
		} else {
			this.template = NoWebGL.templates.standard;
		}
	}

	/* Should be changed as quickly as we get something nice up on gooengine.com */
	NoWebGL.prototype.upgradeLocation = 'http://goodemos.com/recommended.html';

	NoWebGL.prototype.gooLocation = 'http://gooengine.com';

	NoWebGL.templates = {};


	NoWebGL.templates.standard = {};
	NoWebGL.templates.standard.css = '' +
	'#unsupportedBrowser {' +
		'z-index: 10000;' +
		'position: absolute;' +
		'top: 0;' +
		'left: 0;' +
		'width: 100%;' +
		'background: #1c1c1c;' +
		'border-top: 1px solid #2a3276;' +
		'font-family: Helvetica Neue;' +
		'font-size: 90%;' +
		'line-height: 145%;' +
	'}' +
	'#unsupportedBrowser a.button {' +
		'-webkit-border-radius: 18px;' +
		'-moz-border-radius: 18px;' +
		'-o-border-radius: 18px;' +
		'border-radius: 18px;' +
		'margin: 5px 20px 0 0;' +
		'text-align: left;' +
		'padding: 10px 25px;' +
		'color: #1d1d1d;' +
		'font-weight: 600;' +
		'font-style: italic;' +

		'display: inline-block;' +
		'text-shadow: 0px 1px 1px #8372da;' +
		'filter: dropshadow(color=#02c2df, offx=0, offy=1);' +
		'-moz-box-shadow: inset 1px 1px 2px 0 #a9b1fd;' +
		'-o-box-shadow: inset 1px 1px 2px 0 #a9b1fd;' +
		'-webkit-box-shadow: inset 1px 1px 2px 0 #a9b1fd;' +
		'box-shadow: inset 1px 1px 2px 0 #a9b1fd;' +
		'background: #2a3276;' +
		'background-image: -ms-linear-gradient(top, #2a3276 0%, #6b7aff 100%);' +
		'background-image: -moz-linear-gradient(top, #2a3276 0%, #6b7aff 100%);' +
		'background-image: -o-linear-gradient(top, #2a3276 0%, #6b7aff 100%);' +
		'background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #2a3276), color-stop(1, #6b7aff));' +
		'background-image: -webkit-linear-gradient(top, #2a3276 0%, #6b7aff 100%);' +
		'background-image: linear-gradient(top, #2a3276 0%, #6b7aff 100%);' +
		'filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#2a3276", endColorstr="#6b7aff");' +
	'}' +
	'#unsupportedBrowser a.button:hover {' +
		'-moz-box-shadow: inset 3px 3px 5px 0 #a9b1fd;' +
		'-o-box-shadow: inset 3px 3px 5px 0 #a9b1fd;' +
		'-webkit-box-shadow: inset 3px 3px 5px 0 #a9b1fd;' +
		'box-shadow: inset 3px 3px 5px 0 #a9b1fd;' +
		'background: #6b7aff;' +
		'background-image: -ms-linear-gradient(top, #6b7aff 0%, #2a3276 100%);' +
		'background-image: -moz-linear-gradient(top, #6b7aff 0%, #2a3276 100%);' +
		'background-image: -o-linear-gradient(top, #6b7aff 0%, #2a3276 100%);' +
		'background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #6b7aff), color-stop(1, #2a3276));' +
		'background-image: -webkit-linear-gradient(top, #6b7aff 0%, #2a3276 100%);' +
		'background-image: linear-gradient(top, #6b7aff 0%, #2a3276 100%);' +
		'filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#6b7aff\', endColorstr=\'#2a3276\'); }' +
	'#unsupportedBrowser > svg {' +
		'margin-top: 5px;' +
	'}' +
	'#unsupportedBrowser > .logo {' +
		'background-image: -moz-radial-gradient(50% 250px, circle farthest-corner, #6b7aff, #2a3276 100%);' +
		'background-image: -webkit-radial-gradient(50% 250px, circle farthest-corner, #6b7aff, #2a3276 100%);' +
		'background-image: -o-radial-gradient(50% 250px, circle farthest-corner, #6b7aff, #2a3276 100%);' +
		'background-image: -ms-radial-gradient(50% 250px, circle farthest-corner, #6b7aff, #2a3276 100%);' +
		'background-image: radial-gradient(50% 250px, circle farthest-corner, #6b7aff, #2a3276 100%);' +
	'}' +
	'#unsupportedBrowser > .content {' +
		'color: #9f9f9f;' +
		'max-width: 700px;' +
		'margin-left: 120px;' +
		'margin-right: 20px;' +
		'padding-top: 1em;' +
	'}' +
	'#unsupportedBrowser p {' +
		'margin: 0 0 25px 0;' +
	'}' +
	'#unsupportedBrowser h1 {' +
		'display: inline-block;' +
		'max-width: 600px;' +
		'margin: 13px 0 25px 20px;' +
		'color: #f1eee5;' +
		'vertical-align: top;' +
		'font-weight: normal' +
	'}';
	NoWebGL.templates.standard.html = '' +
		'<div class="logo">'+
			'<a href="http://gooengine.com">' +
			Logo.getLogo({ color: Logo.white, shadow: true, width: '100px', height: '70px' }) +
			'</a>' +
			'<h1>Whoopsie daisy!</h1>' +
		'</div>' +
		'<div class="content">' +
			'<p>Your browser doesn\'t seem to support HTML5 and WebGL. The best thing to do is upgrade to a modern browser that supports all the awesome things the web has to offer.</p>' +
			'<p><a data-upgrade class="button" href="">Upgrade my browser!</a>' +
			'<a data-close class="button" href="">Not now</a></p>' +
		'</div>' +
	'';

	NoWebGL.prototype.show = function() {
		// Create html
		var element = document.createElement('div');
		element.innerHTML = this.template.html;
		element.setAttribute('id', 'unsupportedBrowser');

		// Create css
		var style = document.createElement('style');
		style.type = 'text/css';
		style.setAttribute('id', 'unsupportedBrowserStyles');

		if(style.stylesheet) {
				style.stylesheet.cssText = this.template.css;
		} else {
				style.appendChild(document.createTextNode(this.template.css));
		}

		// Attach everything to the DOM
		document.head.appendChild(style);
		document.body.appendChild(element);


		var closeElement = element.querySelector('[data-close]');
		closeElement.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();

				document.body.removeChild(document.querySelector('div#unsupportedBrowser'));
				document.head.removeChild(document.querySelector('#unsupportedBrowserStyles'));
		});
		var upgradeElement = element.querySelector('[data-upgrade]');

		var upgrade = function(e) {
				e.preventDefault();
				e.stopPropagation();
				document.location.href = this.upgradeLocation;
		}.bind(this);
		upgradeElement.addEventListener('click', upgrade);
	};

	NoWebGL.prototype.addTemplate = function(name, template) {
		if(!NoWebGL.templates[name]) {
			NoWebGL.templates[name] = template;
		} else {
			console.error('Template ' + name + ' already exists');
		}
	};

	return NoWebGL;
});
