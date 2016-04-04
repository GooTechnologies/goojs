/**
 * Get logo svg in different formats
 * Only used to define the class. Should never be instantiated.
 */
function Logo() {}

/** @type {string} */
Logo.blue = '#2A3276';
/** @type {string} */
Logo.white = '#FFFFFF';

var defaults = {
	color: Logo.white,
	shadow: false
};

/**
 * Get svg as string to add to html DOM
 * @param {Object} properties
 * @param {string} [properties.color=Logo.blue]
 * @param {boolean} [properties.shadow=false]
 * @param {string} [properties.width]
 * @param {string} [properties.height]
 */
Logo.getLogo = function (properties) {
	properties = properties || {};
	for (var key in defaults) {
		if (properties[key] === undefined) {
			properties[key] = defaults[key];
		}
	}

	if (!document.createElementNS) { return ''; }

	var xmlns = 'http://www.w3.org/2000/svg';
	var svg = document.createElementNS(xmlns, 'svg');
	svg.setAttribute('version', '1.1');
	svg.setAttribute('xmlns', xmlns);
	svg.setAttribute('x', '0px');
	svg.setAttribute('y', '0px');
	svg.setAttribute('viewBox', '0 0 396.603 277.343');
	svg.setAttribute('enable-background', 'new 0 0 396.603 277.343');
	svg.setAttribute('xml:space', 'preserve');


	if (properties.width) {
		svg.setAttribute('width', properties.width);
	}
	if (properties.height) {
		svg.setAttribute('height', properties.height);
	}

	var g = document.createElementNS(xmlns, 'g');

	svg.appendChild(g);


	var shadowFilter = document.createElementNS(xmlns, 'filter');
	shadowFilter.setAttribute('id', 'insetShadow');

	var gauss = document.createElementNS(xmlns, 'feGaussianBlur');
	gauss.setAttribute('in', 'SourceAlpha');
	gauss.setAttribute('stdDeviation', '0');

	var offset = document.createElementNS(xmlns, 'feOffset');
	offset.setAttribute('dx', '0');
	offset.setAttribute('dy', '-5');
	offset.setAttribute('result', 'offsetblur');

	var compTransfer = document.createElementNS(xmlns, 'feComponentTransfer');
	var funcA = document.createElementNS(xmlns, 'feFuncA');
	funcA.setAttribute('type', 'linear');
	funcA.setAttribute('slope', '0.5');
	compTransfer.appendChild(funcA);

	var merge = document.createElementNS(xmlns, 'feMerge');
	var mn1 = document.createElementNS(xmlns, 'feMergeNode');
	var mn2 = document.createElementNS(xmlns, 'feMergeNode');
	mn2.setAttribute('in', 'SourceGraphic');
	merge.appendChild(mn1);
	merge.appendChild(mn2);

	shadowFilter.appendChild(gauss);
	shadowFilter.appendChild(offset);
	shadowFilter.appendChild(compTransfer);
	shadowFilter.appendChild(merge);

	g.appendChild(shadowFilter);
	var path = document.createElementNS(xmlns, 'path');
	path.setAttribute('d', 'M303.337,46.286c-13.578,0-25.784,5.744-34.396,14.998c-9.86,10.59-26.319,10.59-36.172,0' +
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
		'S158.483,207.256,145.687,207.256z');
	path.setAttribute('fill', properties.color);
	if (properties.shadow) {
		g.appendChild(shadowFilter);
		path.setAttribute('style', 'filter:url(#insetShadow)');
	}
	g.appendChild(path);

	var serializer = new XMLSerializer();
	var str = serializer.serializeToString(svg);
	return str;
};

module.exports = Logo;