({
	baseUrl : '../examples',
	paths: {
        goo: '../src/goo',
		almond: '../build/almond'
    },	
	name: 'almond',
    include: ['start'],
    insertRequire: ['start'],
	out : 'extracted.js',
	useStrict : true,
	optimize : 'none',
	wrap: true
})