define [
	'goo/loaders/handlers/ConfigHandler'
	
	'goo/renderer/MeshData'

	'goo/loaders/JsonUtils'
	'goo/util/PromiseUtil'
	'goo/util/ObjectUtil'
	
], (
ConfigHandler,
MeshData,
JsonUtils,
pu,
_) ->


	# Perhaps move to utils later
	_getTypedArray = (bindata, format, range)->
		if format == 'float32'
			new Float32Array(bindata.slice(range[0], range[1]))
		else if format == 'uint16'
			new Uint16Array(bindata.slice(range[0], range[1]))



	class MeshDataHandler extends ConfigHandler
		@_register('mesh')
	
		constructor: (@world, @getConfig, @updateObject, @options)->
			@_objects = {}


		_create: (meshConfig)->
			# We do everything in update instead			
			
		update: (ref, meshConfig)->
			if not @_objects[ref]
				if meshConfig.binary_data
					@getConfig(meshConfig.binary_data).then (bindata)=>
						if not bindata then throw new Error("Binary mesh data was empty")
						@_createMeshData(meshConfig, bindata)
						.then (meshData)=>
							@_objects[ref] = meshData
				else
					@_createMeshData(meshConfig, null)
					.then (meshData)=>
						@_objects[ref] = meshData
			else
				pu.createDummyPromise(@_objects[ref])

		remove: (ref)->
			# Do nothing, we didn't save anything
			

		# Returns promise that resolves with the created meshdata object
		_createMeshData: (meshConfig, bindata)->

			if meshConfig.compression and meshConfig.compression.compressed
				compression = 
					compressedVertsRange: meshConfig.compression.compressedVertsRange or (1 << 14) - 1 #int
					compressedColorsRange: meshConfig.compression.compressedColorsRange or (1 << 8) - 1 #int
					compressedUnitVectorRange: meshConfig.compression.compressedUnitVectorRange or (1 << 10) - 1 #int

			if bindata
				# Binary data is stored in a separate file. Experimental format. 

				indices = _getTypedArray(bindata, 'uint16', meshConfig.indices)
				meshConfig.indices = indices

				textureCoords = []
				for layer, idx in meshConfig.textureCoords
					textureCoords[idx] = _getTypedArray(bindata, 'float32', layer)
				meshConfig.textureCoords = textureCoords

				meshConfig.vertices = _getTypedArray(bindata, 'float32', meshConfig.vertices)

				meshConfig.normals = _getTypedArray(bindata, 'float32', meshConfig.normals)

			if meshConfig.type == 'SkinnedMesh'
				meshData = @_parseMeshData(meshConfig.data or meshConfig, 4, 'SkinnedMesh', compression)
				meshData.type = MeshData.SKINMESH
			else
				meshData = @_parseMeshData(meshConfig.data or meshConfig, 0, 'Mesh', compression)
				meshData.type = MeshData.MESH

			if meshConfig.pose
				skelRef = meshConfig.pose
				@getConfig(skelRef).then (skelConfig)=>
					@updateObject(skelRef, skelConfig).then (skeleton)=>
						pose = new SkeletonPose(skeleton)
						pose.setToBindPose()
						meshData.currentPose = pose
						return meshData
			else
				pu.createDummyPromise(meshData)


		# Returns MeshData object
		_parseMeshData: (data, weightsPerVert, type, compression)->
			vertexCount = data.vertexCount # int
			if vertexCount == 0 then return null
	
			indexCount = data.indexLengths?[0] or  data.indices?.length or 0
			
			attributeMap = {}
			if (data.vertices && data.vertices.length > 0)
				attributeMap.POSITION = MeshData.createAttribute(3, 'Float')
			
			if (data.normals && data.normals.length > 0)
				attributeMap.NORMAL = MeshData.createAttribute(3, 'Float')
			
			if (data.tangents && data.tangents.length > 0) 
				attributeMap.TANGENT = MeshData.createAttribute(4, 'Float')
			
			if (data.colors && data.colors.length > 0) 
				attributeMap.COLOR = MeshData.createAttribute(4, 'Float')
			
			if (weightsPerVert > 0 && data.weights) 
				attributeMap.WEIGHTS = MeshData.createAttribute(4, 'Float')
			
			if (weightsPerVert > 0 && data.joints) 
				attributeMap.JOINTIDS = MeshData.createAttribute(4, 'Short')
			
			if (data.textureCoords && data.textureCoords.length > 0)
				for texCoords, texIdx in data.textureCoords
					attributeMap['TEXCOORD' + texIdx] = MeshData.createAttribute(2, 'Float')

			#console.log "Parsing mesh data: #{_.keys(attributeMap).join(',')}"
				
			meshData = new MeshData(attributeMap, vertexCount, indexCount)
	
			if data.vertices?.length > 0
				if compression? 
					offsetObj = data.vertexOffsets
					JsonUtils.fillAttributeBufferFromCompressedString(
						data.vertices, 
						meshData, 
						MeshData.POSITION, 
						[ 
							data.vertexScale,
							data.vertexScale, 
							data.vertexScale
						], 
						[
							offsetObj.xOffset, 
							offsetObj.yOffset, 
							offsetObj.zOffset
						])
				else if data.vertices instanceof Float32Array
					meshData.getAttributeBuffer(MeshData.POSITION).set(data.vertices)
				else 
					JsonUtils.fillAttributeBuffer(data.vertices, meshData, MeshData.POSITION)
				
			if weightsPerVert > 0 and data.weights
				if compression?
					offset = 0
					scale = 1 / compression.compressedVertsRange
	
					JsonUtils.fillAttributeBufferFromCompressedString(data.weights, meshData, MeshData.WEIGHTS, [scale], [offset])
				else
					JsonUtils.fillAttributeBuffer(data.weights, meshData, MeshData.WEIGHTS)
				
			if data.normals?.length>0
				if compression?
					offset = 1 - (compression.compressedUnitVectorRange + 1 >> 1)
					scale = 1 / -offset
	
					JsonUtils.fillAttributeBufferFromCompressedString(data.normals, meshData, MeshData.NORMAL, 
						[scale, scale, scale], [offset, offset,offset])

				else if data.normals instanceof Float32Array
					meshData.getAttributeBuffer(MeshData.NORMAL).set(data.normals)
				else
					JsonUtils.fillAttributeBuffer(data.normals, meshData, MeshData.NORMAL)
	
			if data.tangents?.length>0
				if compression?
					offset = 1 - (compression.compressedUnitVectorRange + 1 >> 1)
					scale = 1 / -offset
	
					JsonUtils.fillAttributeBufferFromCompressedString(data.tangents, meshData, MeshData.TANGENT, 
						[scale, scale, scale, scale], [offset,offset, offset, offset])
				else
					JsonUtils.fillAttributeBuffer(data.tangents, meshData, MeshData.TANGENT)
	
			if data.colors?.length>0
				if compression?
					offset = 0
					scale = 1 / (compression.compressedColorsRange + 1)
					JsonUtils.fillAttributeBufferFromCompressedString(data.colors, meshData, MeshData.COLOR, 
						[scale, scale, scale, scale], [offset,offset, offset, offset])
				else
					JsonUtils.fillAttributeBuffer(data.colors, meshData, MeshData.COLOR)
	
			if data.textureCoords?.length>0
				textureUnits = data.textureCoords
				if compression?
					for texObj, texIdx in textureUnits
						JsonUtils.fillAttributeBufferFromCompressedString(texObj.UVs, meshData, 'TEXCOORD' + texIdx, texObj.UVScales, texObj.UVOffsets)
				else
					for texObj, texIdx in textureUnits
						attr = 'TEXCOORD' + texIdx
						if texObj instanceof Float32Array
							meshData.getAttributeBuffer(attr).set(texObj)
						else
							JsonUtils.fillAttributeBuffer(texObj, meshData, attr)
	
			if weightsPerVert > 0 and data.joints
				buffer = meshData.getAttributeBuffer(MeshData.JOINTIDS)
	
				if compression
					jointData = JsonUtils.getIntBufferFromCompressedString(data.joints, 32767)
				else
					jointData = JsonUtils.getIntBuffer(data.joints, 32767)
				
				if type == 'SkinnedMesh'
					# map these joints to local.
					localJointMap = [];
					localIndex = 0;
					for jointIndex, idx in jointData
						if localJointMap[jointIndex] == undefined
							localJointMap[jointIndex] = localIndex++
	
						buffer.set([localJointMap[jointIndex]], idx)
	
					# store local map
					localMap = [];
					for localIndex, jointIndex in localJointMap 
						localIndex = localJointMap[jointIndex]
						if localIndex != null
							localMap[localIndex] = jointIndex;
	
					meshData.paletteMap = localMap
					meshData.weightsPerVertex = weightsPerVert
				else
					for jointIdx in [0...jointData.capacity()]
						buffer.putCast(jointIdx, jointData.get(jointIdx))
					
			if data.indices
				if compression?
					meshData.getIndexBuffer().set(JsonUtils.getIntBufferFromCompressedString(data.indices, vertexCount))
				else if data.indices instanceof Uint16Array
					meshData.getIndexBuffer().set(data.indices)

				else					
					meshData.getIndexBuffer().set(JsonUtils.getIntBuffer(data.indices, vertexCount))
	
			if data.indexModes 
				meshData.indexModes = data.indexModes[..]
					
			if data.indexLengths
				meshData.indexLengths = data.indexLengths[..]
	
			if data.boundingBox
				meshData.boundingBox = data.boundingBox
	
			return meshData