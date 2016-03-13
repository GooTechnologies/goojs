var path = require("path");
var fs = require("fs");
var parse = require("jsdoc-parse");
var ejs = require("ejs");

var jsonFile = path.join(__dirname, 'docs.json');
var wstream = fs.createWriteStream(jsonFile);

function itemHasHiddenTag(item){
	return item.customTags && item.customTags.length && item.customTags[0].tag === 'hidden'
}
function sortByNameProperty(a,b){
	return a.name > b.name ? 1 : -1;
}
function stripId(id){
	if(!id) return id;
	return id.replace('<anonymous>~','').replace('()','');
}
function parseParams(params, item){
	return params && params.length ? params.map(function(param){
		if(!param.type){
			warn(item, 'Parameter type not set for "' + param.name + '". Using "any" instead.');
		}
		return {
			name: param.name,
			type: param.type ? param.type.names[0] : 'any',
			optional: param.optional
		};
	}) : [];
}
function warn(item, message){
	var where = item.id;
	if(item.meta && item.meta.filename && item.meta.path){
		where = item.id + '@' + path.join(item.meta.path, item.meta.filename) + ':' + item.meta.lineno;
	}
	console.error('Warning in ' + where + ': ' + message);
}


console.log('Parsing...');
parse({
	src: path.join(__dirname, '../../src/goo/entities/**/*.js')
}).pipe(wstream).on('finish', function (){
	console.log('docs.json created.');

	console.log('Converting...');
	var items = JSON.parse(fs.readFileSync(jsonFile).toString()).sort(sortByNameProperty).map(function(item){
		// If there's params, sort by name
		if(item.params){
			item.params = item.params.sort(sortByNameProperty);
		}

		return item;
	});

	var templateData = {
		classes: {} // id => { name, params, properties, methods }
	};

	// class names, unfiltered
	items.filter(function(item){
		return item.kind === 'constructor'; // 'class' is not listed, if private
	}).forEach(function(classItem){
		templateData.classes[stripId(classItem.id)] = {
			name: classItem.name,
			properties: [],
			methods: [],
			params: [],
			staticProperties: [],
			staticMethods: [],
			private: true
		};
	});

	items.filter(function(item){
		return item.kind === 'class';
	}).forEach(function(classItem){
		var classObject = templateData.classes[stripId(classItem.id)];
		if(!classObject){
			return console.warn('Class "' + stripId(classItem.id) + '" found, but not constructor. Maybe the @class tag couldn\'t be parsed correctly. Note that the class MUST have a description and it MUST be given before @class.');
		}
		classObject.private = false;
	});

	// class constructors
	items.filter(function(item){
		return item.kind === 'constructor';
	}).forEach(function(constructorItem){
		var classObject = templateData.classes[stripId(constructorItem.memberof)];
		if(!classObject){
			console.error('Error: class ' + stripId(constructorItem.memberof) + ' not found for constructor "' + constructorItem.name + '".');
			return;
		}

		classObject.examples = constructorItem.examples ? constructorItem.examples.slice(0) : [];
		classObject.params = parseParams(constructorItem.params, constructorItem);
		classObject.description = constructorItem.description;
	});

	// instance properties
	items.filter(function(item){
		return item.kind === 'member' && item.scope !== "static";
	}).forEach(function(propertyItem){
		var classObject = templateData.classes[stripId(propertyItem.memberof)];
		if(!classObject){
			console.error('Error: class ' + stripId(propertyItem.memberof) + ' not found for property "' + propertyItem.name + '"');
			return;
		}
		classObject.properties.push({
			name: propertyItem.name,
			type: propertyItem.type ? propertyItem.type.names[0] : ''
		});
	});

	// static properties
	items.filter(function(item){
		return item.kind === 'member' && item.scope === "static";
	}).forEach(function(propertyItem){
		var classObject = templateData.classes[stripId(propertyItem.memberof)];
		if(!classObject){
			console.error('Error: class "' + stripId(propertyItem.memberof) + '" not found for static property "' + propertyItem.name + '"');
			return;
		}
		if(propertyItem.params || propertyItem.returns){
			// static method
			classObject.staticMethods.push({
				name: propertyItem.name,
				params: parseParams(propertyItem.params, propertyItem)
			});
		} else {
			// static property
			classObject.staticProperties.push({
				name: propertyItem.name,
				type: propertyItem.type ? propertyItem.type.names[0] : ''
			});
		}
	});

	// instance methods
	items.filter(function(item){
		return item.kind === 'function' && !itemHasHiddenTag(item);
	}).forEach(function(methodItem){
		var classObject = templateData.classes[stripId(methodItem.memberof)];
		if(!classObject){
			console.error('Error: class "' + stripId(methodItem.memberof) + '" not found for method "' + methodItem.name + '"');
			return;
		}
		classObject.methods.push({
			name: methodItem.name,
			params: parseParams(methodItem.params, methodItem)
		});
	});

	var templateString = fs.readFileSync(path.join(__dirname, 'template.ejs')).toString();
	var renderedDocs = ejs.render(templateString, templateData, {});

	fs.writeFileSync(path.join(__dirname, 'index.html'), renderedDocs);
});