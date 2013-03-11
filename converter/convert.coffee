mkdirp = require('mkdirp')
path = require('path')
_ = require('underscore')
basePath = ''
fs = require('fs')

sceneFiles = []

outputFile = (file, data, notinscene) ->
	unless notinscene
		sceneFiles.push file

	file = path.resolve(basePath, file)
	dir = path.dirname(file)
	mkdirp.sync dir
		
	if _.isObject data
		data = JSON.stringify data, null, "\t"
	fs.writeFileSync file, data

convertColor = (hexColor) ->
	color =	for i in [1..7] by 2
		Math.round((parseInt hexColor.substr(i,2), 16)/2.55)/100

convertTextures = (material, textures) ->
	material.textures = []
	for texture in textures
		newtex =
			url: texture.TextureSource
			
		match = texture.TextureSource.match(/^[^\.]*/)
		outputFile "textures/#{match[0]}.tex.json", newtex
		material.textures.push "textures/#{match[0]}.tex"

convertMeshData = (data, entity, compression) ->
	newmesh = 
		data: data.MeshData
		compression: compression
	outputFile "meshes/#{data.Name}.mesh.json", newmesh

	_.extend entity.components,
		meshData:
			mesh: "meshes/#{data.Name}.mesh"


convertChildren = (children, parent, entities, compression) ->
	for child in children
		entity =
			name: child.Name
			components:
				transform:
					translation: child.Transform.Translation
					rotation: child.Transform.Rotation
					scale: child.Transform.Scale
			
		if child.Material?
			_.extend entity.components,
				meshRenderer:
					materials: ["materials/#{child.Material}.mat"]

		if child.MeshData?
			convertMeshData(child, entity, compression)
			
		if parent
			entity.components.transform.parentRef = "entities/#{parent.name}.ent"

		entities.push entity
		if child.Children? then convertChildren(child.Children, entity, entities)

convert = (inputFile, outputPath, objectName) ->	
	file = path.resolve(inputFile)
	basePath = path.resolve(outputPath)
		
	oldObject = require(file)
	
	for material in oldObject.Materials
		newmat =
			uniforms: {}
		newmat.name = material.MaterialName
		
		for key, value of material when /Color$/.test key
			match = key.match(/^(.*)Color$/)
			newkey = match[1]
			newmat.uniforms['material'+newkey] = convertColor(value)
		
		if material.Shininess?
			newmat.uniforms.materialSpecularPower = material.Shininess
		
		if material.TextureEntries?	
			convertTextures(newmat, material.TextureEntries)
	
		# TODO: Should be done in a better way
		newmat.shaderRef = 'shaders/simpleLit.shader'
		
		outputFile "materials/#{newmat.name}.mat.json", newmat
	
	transform = oldObject.Scene.Transform
	entities = []
	compression =
		compressed: oldObject.UseCompression
		compressedVertsRange: oldObject.CompressedVertsRange
		compressedColorsRange: oldObject.CompressedColorsRange
		compressedUnitVectorRange: oldObject.CompressedUnitVectorRange
		
	rootObject =
		name: objectName
		components:
			transform:
				translation: transform.Translation
				scale: transform.Scale
				rotation: transform.Rotation
				
	entities.push rootObject
	
	convertChildren oldObject.Scene.Children, rootObject, entities, compression
	
	
	for entity in entities
		outputFile "entities/#{entity.name}.ent.json", entity
	
	scene =
		files: sceneFiles
		
	outputFile "#{objectName}.scene.json", scene
	
		
exports.convert = convert
