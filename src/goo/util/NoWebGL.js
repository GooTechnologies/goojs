define(
/** lends */
function() {
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
			'<a href="http://gooengine.com"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"' +
				 'width="100px" height="70px" viewBox="0 0 396.603 277.343" enable-background="new 0 0 396.603 277.343"' +
				 'xml:space="preserve">' +
				'<g>' +
					'<filter id="insetShadow" height="130%">' +
						'<feGaussianBlur in="SourceAlpha" stdDeviation="0"/> <!-- stdDeviation is how much to blur -->' +
						'<feOffset dx="0" dy="-5" result="offsetblur"/> <!-- how much to offset -->' +
						'<feComponentTransfer>' +
							'<feFuncA type="linear" slope="0.5"/>' +
						'</feComponentTransfer>' +
						'<feMerge> ' +
							'<feMergeNode/> <!-- this contains the offset blurred image -->' +
							'<feMergeNode in="SourceGraphic"/> <!-- this contains the element that the filter is applied to -->' +
						'</feMerge>' +
					'</filter>' +
					'<path style="filter:url(#insetShadow)" fill="#FFFFFF" d="M303.337,46.286c-13.578,0-25.784,5.744-34.396,14.998c-9.86,10.59-26.319,10.59-36.172,0' +
						'c-8.605-9.254-20.818-14.998-34.402-14.998c-25.936,0-46.971,21.034-46.971,46.978c0,25.936,21.035,46.972,46.971,46.972' +
						'c13.584,0,25.797-5.744,34.402-14.998c9.853-10.598,26.325-10.598,36.172,0c8.612,9.254,20.818,14.998,34.396,14.998' +
						'c25.941,0,46.977-21.036,46.977-46.972C350.313,67.32,329.278,46.286,303.337,46.286z M198.296,116.39' +
						'c-12.785,0-23.146-10.359-23.146-23.144s10.361-23.151,23.146-23.151c12.795,0,23.156,10.367,23.156,23.151' +
						'S211.091,116.39,198.296,116.39z M303.337,116.407c-12.785,0-23.146-10.36-23.146-23.144c0-12.784,10.36-23.151,23.146-23.151' +
						'c12.795,0,23.156,10.367,23.156,23.151C326.493,106.047,316.132,116.407,303.337,116.407z M156.18,138.347' +
						'c-14.087-3.23-22.316-17.482-18.068-31.305c3.704-12.072,2.568-25.511-4.22-37.256C120.927,47.323,92.22,39.63,69.766,52.587' +
						'C47.317,65.552,39.624,94.26,52.581,116.713c6.795,11.761,17.853,19.462,30.17,22.282c14.084,3.235,22.314,17.497,18.074,31.317' +
						'c-3.711,12.08-2.582,25.504,4.213,37.264c12.965,22.455,41.666,30.148,64.127,17.178c22.447-12.945,30.148-41.658,17.185-64.111' +
						'C179.554,148.881,168.497,141.181,156.18,138.347z M104.802,113.287c-11.064,6.387-25.219,2.599-31.604-8.474' +
						'c-6.397-11.07-2.604-25.225,8.474-31.609c11.057-6.398,25.22-2.598,31.611,8.46C119.673,92.741,115.872,106.897,104.802,113.287z' +
						' M145.687,207.256c-12.785,0-23.145-10.361-23.145-23.145s10.359-23.15,23.145-23.15c12.797,0,23.156,10.367,23.156,23.15' +
						'S158.483,207.256,145.687,207.256z"/>' +
				'</g>' +
			'</svg></a>' +
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
