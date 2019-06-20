/**
 * @author Kai Salmen / www.kaisalmen.de
 */

// Imports only related to wrapper
import {
	CodeBuilderInstructions,
	WorkerExecutionSupport
} from "./worker/main/WorkerExecutionSupport.js";
import { CodeSerializer } from "./worker/main/CodeSerializer.js";
import { OBJLoader2 } from "./OBJLoader2.js";

// Imports only related to worker (when standard workers (modules aren't supported) are used)
import { OBJLoader2Parser } from "./worker/parallel/OBJLoader2Parser.js";
import { ObjectManipulator } from "./utils/ObjectManipulator.js";
import { WorkerRunner } from "./worker/parallel/WorkerRunner.js";

/**
 *
 * @param [LoadingManager] manager

 * @constructor
 */
const OBJLoader2Parallel = function ( manager ) {
	OBJLoader2.call( this, manager );
	this.useJsmWorker = false;

	this.workerExecutionSupport = new WorkerExecutionSupport();
	this.workerExecutionSupport.setTerminateWorkerOnLoad( true );
};

OBJLoader2Parallel.prototype = Object.create( OBJLoader2.prototype );
OBJLoader2Parallel.prototype.constructor = OBJLoader2Parallel;

OBJLoader2Parallel.prototype.setUseJsmWorker = function ( useJsmWorker ) {
	this.useJsmWorker = useJsmWorker;
	return this;
};

OBJLoader2Parallel.prototype._configure = function () {
	// check if worker is already available and if so, then fast-fail
	if ( this.workerExecutionSupport.isWorkerLoaded( this.useJsmWorker ) ) return;

	let codeBuilderInstructions = new CodeBuilderInstructions();

	let jsmSuccess = false;
	if ( this.useJsmWorker ) {

		codeBuilderInstructions.setJsmWorkerFile( '../../src/loaders/worker/parallel/jsm/OBJLoader2Worker.js' );
		jsmSuccess = this.workerExecutionSupport.buildWorkerJsm( codeBuilderInstructions );
	}

	if ( ! jsmSuccess ) {

		let codeOBJLoader2Parser = CodeSerializer.serializeClass( 'OBJLoader2Parser', OBJLoader2Parser );
		let codeObjectManipulator = CodeSerializer.serializeObject( 'ObjectManipulator', ObjectManipulator );
		let codeWorkerRunner = CodeSerializer.serializeClass( 'WorkerRunner', WorkerRunner );

		codeBuilderInstructions.addCodeFragment( codeOBJLoader2Parser );
		codeBuilderInstructions.addCodeFragment( codeObjectManipulator );
		codeBuilderInstructions.addCodeFragment( codeWorkerRunner );

//		codeBuilderInstructions.addLibraryImport( '../../node_modules/three/build/three.js' );
		codeBuilderInstructions.addStartCode( 'new WorkerRunner( new OBJLoader2Parser() );' );

		this.workerExecutionSupport.buildWorkerStandard( codeBuilderInstructions );

	}
};

/**
 * @param {ArrayBuffer} content
 * @param {function} callbackOnLoad
 */
OBJLoader2Parallel.prototype.parseParallel = function( content, callbackOnLoad ) {
	this._configure();

	let scope = this;
	let scopedOnAssetAvailable = function ( payload ) {
		scope._onAssetAvailable( payload );
	};

	this.workerExecutionSupport.updateCallbacks( scopedOnAssetAvailable, callbackOnLoad );

	this.workerExecutionSupport.runAsyncParse(
		{
			params: {
				modelName: this.modelName,
				instanceNo: this.instanceNo,
				useIndices: this.useIndices,
				disregardNormals: this.disregardNormals,
				materialPerSmoothingGroup: this.materialPerSmoothingGroup,
				useOAsMesh: this.useOAsMesh,
			},
			materials: this.materialHandler.getMaterialsJSON(),
			data: {
				input: content,
				options: null
			},
			logging: {
				enabled: this.logging.enabled,
				debug: this.logging.debug
			}
		} );
};

export { OBJLoader2Parallel }
