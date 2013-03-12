mkdirp = require('mkdirp')
path = require('path')
_ = require('underscore')
fs = require('fs')
wrench = require('wrench')
basePath = ''
inputDir = ''


# File functions
copyShaderDir = ->
	from = path.resolve 'converter', 'shaders'
	to = path.resolve basePath, 'shaders'
	wrench.copyDirSyncRecursive from, to

copyFile = (source, target) ->
  indata = fs.readFileSync source
  mkdirp.sync path.dirname(target)
  fs.writeFileSync target, indata

outputFile = (file, data, notinscene) ->
	unless notinscene
		sceneFiles.push file

	file = path.resolve(basePath, file)
	dir = path.dirname(file)
	mkdirp.sync dir
		
	if _.isObject data
		data = JSON.stringify data, null, "\t"
	fs.writeFileSync file, data

sceneFiles = []


# Converter functions
convertColor = (hexColor) ->
	color =	for i in [1..7] by 2
		Math.round((parseInt hexColor.substr(i,2), 16)/2.55)/100

convertMaterials = (materials) ->
	for material in materials
		newmat =
			uniforms: {}
		newmat.name = material.MaterialName
		
		for key, value of material when /Color$/.test key
			match = key.match(/^(.*)Color$/)
			newkey = match[1]
			newmat.uniforms['material'+newkey] = convertColor(value)
		
		if material.Shininess?
			newmat.uniforms.materialSpecularPower = material.Shininess
		
		# TODO: Should be done in a better way
		if material.TextureEntries?	
			convertTextures(newmat, material.TextureEntries)
			newmat.shaderRef = 'shaders/texturedLit.shader'
		else 
			newmat.shaderRef = 'shaders/simpleLit.shader'
		
		outputFile "materials/#{newmat.name}.mat.json", newmat

convertTextures = (material, textures) ->
	material.textures = []
	for texture in textures
		newtex =
			url: 'resources/'+texture.TextureSource
			
		match = texture.TextureSource.match(/^[^\.]*/)
		outputFile "textures/#{match[0]}.tex.json", newtex
		material.textures.push "textures/#{match[0]}.tex"
		infile = path.resolve(inputDir, texture.TextureSource)
		outfile = path.resolve(basePath, newtex.url)
		copyFile infile, outfile
		
convertMeshData = (data, entity, type, compression) ->
	newmesh = 
		data: data.MeshData
		compression: compression
		type: type
	outputFile "meshes/#{data.Name}.mesh.json", newmesh

	_.extend entity.components,
		meshData:
			mesh: "meshes/#{data.Name}.mesh"

convertRotation = (matrix) ->
	#Taken and rewritten from Matrix3x3.toAngles
	EPSILON = 0.0000001
	result = []
	if (matrix[3] > 1 - EPSILON)  # singularity at north pole
		result[1] = Math.atan2(matrix[2], matrix[8])
		result[2] = Math.PI / 2
		result[0] = 0
	else if (matrix[3] < -1 + EPSILON) # singularity at south pole
		result[1] = Math.atan2(matrix[2], matrix[8])
		result[2] = -Math.PI / 2
		result[0] = 0
	else
		result[1] = Math.atan2(-matrix[2], matrix[0])
		result[0] = Math.atan2(-matrix[7], matrix[4])
		result[2] = Math.asin(matrix[1])
	return result

convertChildren = (children, parent, entities, compression) ->
	for child in children
		entity =
			name: child.Name
			components:
				transform:
					translation: child.Transform.Translation
					rotation: convertRotation(child.Transform.Rotation)
					scale: child.Transform.Scale

		if child.Material?
			_.extend entity.components,
				meshRenderer:
					materials: ["materials/#{child.Material}.mat"]

		if child.MeshData?
			convertMeshData(child, entity, child.Type, compression)
			
		if parent
			entity.components.transform.parentRef = "entities/#{parent.name}.ent"
			
		entities.push entity
		if child.Children? then convertChildren(child.Children, entity, entities, compression)


# Main function
convert = (inputFile, outputPath, objectName) ->	
	file = path.resolve(inputFile)
	basePath = path.resolve(outputPath)
	inputDir = path.resolve(path.dirname(inputFile))
	
	data = fs.readFileSync file
	oldObject = JSON.parse(data)	
	
	convertMaterials oldObject.Materials

	entities = []
	compression =
		compressed: oldObject.UseCompression
		compressedVertsRange: oldObject.CompressedVertsRange
		compressedColorsRange: oldObject.CompressedColorsRange
		compressedUnitVectorRange: oldObject.CompressedUnitVectorRange
	
	oldObject.Scene.Name = objectName
	
	convertChildren [oldObject.Scene], null, entities, compression
	
	for entity in entities
		outputFile "entities/#{entity.name}.ent.json", entity
	
	scene =
		files: sceneFiles
		
	outputFile "#{objectName}.scene.json", scene
	
	copyShaderDir()

		
exports.convert = convert
