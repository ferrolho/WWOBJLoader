import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

import { OBJLoader2, MtlObjBridge } from 'wwobjloader2';
import { ResourceDescriptor } from '../ResourceDescriptor.js';
import {
	AssetPipelineLoader,
	AssetPipeline,
	AssetTask
} from '../AssetPipelineLoader.js';

export class AssetPipelineLoaderExample {

	constructor(elementToBindTo) {
		this.renderer = null;
		this.canvas = elementToBindTo;
		this.aspectRatio = 1;

		this.scene = null;
		this.cameraDefaults = {
			posCamera: new THREE.Vector3(0.0, 175.0, 500.0),
			posCameraTarget: new THREE.Vector3(0, 0, 0),
			near: 0.1,
			far: 10000,
			fov: 45
		};
		this.camera = null;
		this.cameraTarget = this.cameraDefaults.posCameraTarget;

		this.controls = null;
	}

	initGL() {
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true,
			autoClear: true
		});
		this.renderer.setClearColor(0x050505);

		this.scene = new THREE.Scene();

		this.recalcAspectRatio();
		this.camera = new THREE.PerspectiveCamera(this.cameraDefaults.fov, this.aspectRatio, this.cameraDefaults.near, this.cameraDefaults.far);
		this.resetCamera();
		this.controls = new TrackballControls(this.camera, this.renderer.domElement);

		let ambientLight = new THREE.AmbientLight(0x404040);
		let directionalLight1 = new THREE.DirectionalLight(0xC0C090);
		let directionalLight2 = new THREE.DirectionalLight(0xC0C090);

		directionalLight1.position.set(- 100, - 50, 100);
		directionalLight2.position.set(100, 50, - 100);

		this.scene.add(directionalLight1);
		this.scene.add(directionalLight2);
		this.scene.add(ambientLight);

		let helper = new THREE.GridHelper(1200, 60, 0xFF4444, 0x404040);
		this.scene.add(helper);
	}

	initContent() {
		let assetTask0 = new AssetTask('task0');
		let rdMtl = new ResourceDescriptor('./models/obj/main/female02/female02.mtl').setNeedStringOutput(true);
		assetTask0.setResourceDescriptor(rdMtl);
		let loaderConfigurationMtl = {
			resourcePath: './models/obj/main/female02/',
			materialOptions: {}
		};
		assetTask0.setAssetHandler(new MTLLoader(), loaderConfigurationMtl);

		let assetTask1 = new AssetTask('task1');
		assetTask1.setLinker(true);
		assetTask1.setAssetHandler(MtlObjBridge);

		let assetTask2 = new AssetTask('task2');
		let rdObj = new ResourceDescriptor('./models/obj/main/female02/female02.obj');
		assetTask2.setResourceDescriptor(rdObj);
		assetTask2.setAssetHandler(new OBJLoader2());

		let assetPipeline = new AssetPipeline();
		assetPipeline.addAssetTask(assetTask0);
		assetPipeline.addAssetTask(assetTask1);
		assetPipeline.addAssetTask(assetTask2);

		let assetPipelineLoader = new AssetPipelineLoader('testAssetPipelineLoader', assetPipeline);
		assetPipelineLoader.setBaseObject3d(this.scene);
		assetPipelineLoader.run();
	}

	resizeDisplayGL() {
		this.controls.handleResize();

		this.recalcAspectRatio();
		this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight, false);

		this.updateCamera();
	}

	recalcAspectRatio() {
		this.aspectRatio = (this.canvas.offsetHeight === 0) ? 1 : this.canvas.offsetWidth / this.canvas.offsetHeight;
	}

	resetCamera() {
		this.camera.position.copy(this.cameraDefaults.posCamera);
		this.cameraTarget.copy(this.cameraDefaults.posCameraTarget);

		this.updateCamera();
	}

	updateCamera() {
		this.camera.aspect = this.aspectRatio;
		this.camera.lookAt(this.cameraTarget);
		this.camera.updateProjectionMatrix();
	}

	render() {
		if (!this.renderer.autoClear) this.renderer.clear();
		this.controls.update();
		this.renderer.render(this.scene, this.camera);
	}

	static executeExample(app) {
		let resizeWindow = function() {
			app.resizeDisplayGL();
		};

		let render = function() {
			requestAnimationFrame(render);
			app.render();
		};

		window.addEventListener('resize', resizeWindow, false);

		console.log('Starting initialisation phase...');
		app.initGL();
		app.resizeDisplayGL();
		app.initContent();

		render();
	}
}