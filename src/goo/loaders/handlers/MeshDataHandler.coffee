define [
	'goo/loaders/handlers/ConfigHandler'
	
	'goo/renderer/MeshData'
	'goo/animation/SkeletonPose'

	'goo/loaders/JsonUtils'
	'goo/util/PromiseUtil'
	'goo/util/ObjectUtil'
	'goo/util/ArrayUtil'
], (
ConfigHandler,
MeshData,
SkeletonPose,
JsonUtils,
PromiseUtil,
_
ArrayUtil
) ->





	class MeshDataHandler extends ConfigHandler
		@_register('mesh')

		constructor: (@world, @getConfig, @updateObject, @options)->
			@_objects = {}

			
		update: (ref, meshConfig)->

			if not @_objects[ref]
				if meshConfig.binaryData
					@getConfig(meshConfig.binaryData).then (bindata)=>
						if not bindata then throw new Error("Binary mesh data was empty")
						@_createMeshData(meshConfig, bindata)
						.then (meshData)=>
							@_objects[ref] = meshData
				else
					@_createMeshData(meshConfig, null)
					.then (meshData)=>
						@_objects[ref] = meshData
			else
				PromiseUtil.createDummyPromise(@_objects[ref])

		remove: (ref)->
			# Do nothing, we didn't save anything
			

		# Returns promise that resolves with the created meshdata object
		_createMeshData: (meshConfig, bindata)->

			if meshConfig.compression and meshConfig.compression.compressed
				compression = 
					compressedVertsRange: meshConfig.compression.compressedVertsRange or (1 << 14) - 1 #int
					compressedColorsRange: meshConfig.compression.compressedColorsRange or (1 << 8) - 1 #int
					compressedUnitVectorRange: meshConfig.compression.compressedUnitVectorRange or (1 << 10) - 1 #int

			meshData = @_createMeshDataObject(meshConfig)
			@_fillMeshData(meshData, meshConfig, bindata, compression)

			# Backwards compatibility
			if meshConfig.pose then meshConfig.poseRef = meshConfig.pose

			###
			if meshConfig.poseRef
				skelRef = meshConfig.poseRef
				@getConfig(skelRef).then (skelConfig)=>
					@updateObject(skelRef, skelConfig).then (skeleton)=>
						meshData.currentPose = skeleton
						return meshData
			else
			###
			PromiseUtil.createDummyPromise(meshData)


		# Creates a MeshData object with the given config
		_createMeshDataObject: (config)->
			data = config.data or config
			if config.type == 'SkinnedMesh'
				weightsPerVert = 4
				type = MeshData.SKINMESH
			else
				weightsPerVert = 0
				type = MeshData.MESH

			
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

			#console.log "Parsing mesh @_data: #{_.keys(attributeMap).join(',')}"
				
			meshData = new MeshData(attributeMap, vertexCount, indexCount)
			meshData.type = type
			return meshData


		_fillMeshData: (meshData, config, bindata, compression)->
			data = config.data or config

			if meshData.type == MeshData.SKINMESH
				weightsPerVert = 4
			else
				weightsPerVert = 0


			_fillAttributeBuffer = (attr, data)=>
				if data?.length
					if compression
						opts = @_getCompressionOptions(attr, config, compression)
						JsonUtils.fillAttributeBufferFromCompressedString(data, meshData, attr, opts.scale, opts.offset)
					else if bindata
						meshData.getAttributeBuffer(attr).set(ArrayUtil.getTypedArray(bindata, data))
					else
						JsonUtils.fillAttributeBuffer(data, meshData, attr)			

			_fillAttributeBuffer(MeshData.POSITION, data.vertices)
			_fillAttributeBuffer(MeshData.NORMAL, data.normals)
			_fillAttributeBuffer(MeshData.TANGENT, data.tangents)
			_fillAttributeBuffer(MeshData.COLOR, data.colors)
				
			if meshData.type == MeshData.SKINMESH
				_fillAttributeBuffer(MeshData.WEIGHTS, data.weights)

			if data.textureCoords?.length>0
				textureUnits = data.textureCoords
				for texObj, texIdx in textureUnits
					attr = 'TEXCOORD' + texIdx
					_fillAttributeBuffer(attr, texObj.UVs or texObj)
	
			if weightsPerVert > 0 and data.joints?.length
				buffer = meshData.getAttributeBuffer(MeshData.JOINTIDS)
				jointData = @_getIntBuffer(data.joints, 32767, bindata, compression)
				
				if meshData.type == MeshData.SKINMESH
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
				meshData.getIndexBuffer().set(@_getIntBuffer(data.indices, data.vertexCount, bindata, compression))
	
			if data.indexModes then meshData.indexModes = data.indexModes[..]
			if data.indexLengths then meshData.indexLengths = data.indexLengths[..]
			if data.boundingBox then meshData.boundingBox = data.boundingBox
	
			return meshData


		_getIntBuffer: (data, len, bindata, compression) ->
			if not data
				null
			else if compression
				JsonUtils.getIntBufferFromCompressedString(data, len)
			else if bindata
				ArrayUtil.getTypedArray(bindata, data)
			else
				JsonUtils.getIntBuffer(data, len)



		# Extract config for legacy compression format
		# returns an object with properties offset: [], scale: []
		_getCompressionOptions: (attr, config, compression)->
			data = config.data or config

			if attr == MeshData.POSITION
				offsetObj = data.vertexOffsets
				options = 
					offset:[
						offsetObj.xOffset, 
						offsetObj.yOffset, 
						offsetObj.zOffset
					]
					scale: [ 
						data.vertexScale,
						data.vertexScale, 
						data.vertexScale
					]
			
			else if attr == MeshData.WEIGHTS
				offset = 0
				scale = 1 / compression.compressedVertsRange
				options =  
					offset: [offset]
					scale: [scale]
			
			else if attr == MeshData.NORMAL
				offset = 1 - (compression.compressedUnitVectorRange + 1 >> 1)
				scale = 1 / -offset
				options =  
					offset: [offset, offset, offset]
					scale: [scale, scale, scale]

			else if attr == MeshData.TANGENT
				offset = 1 - (compression.compressedUnitVectorRange + 1 >> 1)
				scale = 1 / -offset
				options =  
					offset: [offset, offset, offset, offset]
					scale: [scale, scale, scale, scale]

			else if attr == MeshData.COLOR
				offset = 0
				scale = 1 / (compression.compressedColorsRange + 1)
				options =  
					offset: [offset, offset, offset, offset]
					scale: [scale, scale, scale, scale]

			else if attr.substr(0,8) == 'TEXCOORD'
				texIdx = parseInt(attr.substr(8))
				texObj = data.textureCoords[texIdx]
				options =
					offset: texObj.UVOffsets 
					scale: texObj.UVScales
