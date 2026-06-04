// Author: Matthew Anderson
// CSC 385 Computer Graphics
// Version: Winter 2020
// Project 2: Main program.
// Initializes scene, VR system, and event handlers.

import * as THREE from '../extern/build/three.module.js';
import { VRButton } from '../extern/VRButton.js';
import {DebugConsole, debugWrite} from './DebugConsole.js';
import * as DEBUG from './DebugHelper.js';
import * as GUIVR from './GuiVR.js';
import * as ANIMATOR from './Animator.js';
import * as USER from './User.js';
import * as BLOCKS from './MovingBlocks.js';
import * as SAUCER from './FlyingSaucer.js';
// Imports for model loading.  The import depends on the model file type.
// There are other model types that can be loaded.
import {FBXLoader}  from '../extern/examples/jsm/loaders/FBXLoader.js';
//import {GLTFLoader}  from '../extern/examples/jsm/loaders/GLTFLoader.js';
//import {OBJLoader}  from '../extern/examples/jsm/loaders/OBJLoader.js';


// Global variables for high-level program state.
var camera, scene, renderer;
var userRig; // rig to move the user
var animatedObjects = []; // List of objects whose animation function needs to be called each frame.

function initMovingBlocks(userRig)
{
  var game1 = new BLOCKS.movingBlocks(userRig, 1, 1, 1, "hard");
  var game2 = new BLOCKS.movingBlocks(userRig, 2, 1, 2, "easy");
  var game3 = new BLOCKS.movingBlocks(userRig, 1.5, 1.5, 1.5, "medium");
  game1.rotateY(THREE.Math.degToRad(360));
  game1.position.z = -15;
  game1.position.x = -10;
  scene.add(game1);
  animatedObjects.push(game1);
  game2.rotateY(THREE.Math.degToRad(360));
  game2.position.z = -15;
  game2.position.x = 20;
  scene.add(game2);
  animatedObjects.push(game2);
  game3.rotateY(THREE.Math.degToRad(360));
  game3.position.z = -18;
  game3.position.x = 0;
  scene.add(game3);
  animatedObjects.push(game3);
}

function initFlyingSaucer(userRig)
{
    var ride1 = new SAUCER.FlyingSaucer(userRig, 15, 'white');
    var ride2 = new SAUCER.FlyingSaucer(userRig, 20, 'green');
    var ride3 = new SAUCER.FlyingSaucer(userRig, 10, 'red');
    ride1.position.z = -8.5;
    ride1.position.x = 0;
    animatedObjects.push(ride1);
    scene.add(ride1);
    ride2.position.z = -2;
    ride2.position.x = 15;
    animatedObjects.push(ride2);
    scene.add(ride2);
    ride3.position.z = -2;
    ride3.position.x = -15;
    animatedObjects.push(ride3);
    scene.add(ride3);
}

function initExhibit1(userRig){

    // Exhibit 1 - Animation Example

    var exhibit = new THREE.Group();
    // Add landing platform for the exhibit.
    exhibit.add(new USER.UserPlatform(userRig));

    // Add moving platform.
    var coaster = new USER.UserPlatform(userRig);
    coaster.rotation.y =  THREE.Math.degToRad(-90);
    coaster.speed = 1; // new member variable to track speed
    coaster.position.z = -5;
    coaster.position.x = -5;
    // Set animation function to repeatedly move from x=-5 to 5.
    coaster.setAnimation(
	function (dt){
	    if (this.t == undefined) {
		this.t = 0;
	    }
	    this.t = this.t + dt;
	    this.position.x += dt * this.speed;
	    this.position.x = ((this.position.x + 5) % 10) - 5;
	});
    animatedObjects.push(coaster);
    exhibit.add(coaster);

    // Make a GUI sign.
    var buttons = [new GUIVR.GuiVRButton("Speed", 1, 0, 10, true,
					 function(x){coaster.speed = x;})];
    var sign = new GUIVR.GuiVRMenu(buttons);
    sign.position.x = 0;
    sign.position.z = -2;
    sign.position.y = 0.5;
    exhibit.add(sign);

    // Pose the exhibit.
    exhibit.rotation.y = THREE.Math.degToRad(90);
    exhibit.position.z = -5;
    exhibit.position.x = -3;

    scene.add(exhibit);

}

function initExhibit2(userRig){

    // Exhibit 2 - OBJ Loading Example
    let controllerModel = new THREE.Mesh(
	new THREE.BoxGeometry(0.25, 0.25, 0.25),
	new THREE.MeshPhongMaterial({color: 0xff0000}));

    var exhibit = new THREE.Group();
    exhibit.add(new USER.UserPlatform(
	userRig,
	function (){
	    console.log("Landing at Exhibit 2");
	    // Get controller's position
	    let controller = userRig.getController(0);
	    // Add new model for controller (should be removed on leaving).
	    controller.add(controllerModel);
	    // Set animation to check whether trigger button is
	    // pressed and then fire a projectile in the frame of the
	    // controller if is and enough time has elapsed since last
	    // firing.
	    controller.setAnimation(
		function (dt){
		    if (this.t == undefined){
			this.t = 0;
		    }
		    this.t += dt;
		    // Decide to fire.
		    if (controller.triggered
			&& (this.t - this.lastFire >= 10
			    || this.lastFire == undefined)){
			this.lastFire = this.t;
			// Create new projectile and set up motion.
			let proj = controllerModel.clone();
			console.log("Firing");
			controller.add(proj);
			proj.setAnimation(
			    function (dt){
				if (this.t == undefined){
				    this.t = 0;
				}
				this.t += dt;
				this.position.z -= dt;
				// Cause the projectile to disappear after t is 20.
				if (this.t > 20){
				    this.parent.remove(this);
				}
			    }
			);
		    }
		}
	    );

	},
	function (){
	    console.log("Leaving Exhibit 2");
	    let controller = userRig.getController(0);
	    // Clear the model added to controller.
	    controller.remove(controllerModel);
	    // Remove special animation attached to controller.
	    controller.setAnimation(undefined);
	}
    ));

    // Rig to hold the loaded model.
    var rig = new THREE.Group();
    rig.rotation.y = THREE.Math.degToRad(-90);
    rig.speed = 1;
    rig.position.y = 0;
    rig.position.z = -5;
    // Make the rig slowly rotate.
    rig.setAnimation(
	function (dt){
	    this.rotation.y += this.speed * 0.01;
	});
    animatedObjects.push(rig);
    exhibit.add(rig);

    // Make GUI sign.
    var buttons = [new GUIVR.GuiVRButton("Speed", 1, 0, 10, true,
					 function(x){rig.speed = x;})];
    var sign = new GUIVR.GuiVRMenu(buttons);
    sign.position.x = 0;
    sign.position.z = -2;
    sign.position.y = 0.5;
    exhibit.add(sign);

    // Load the model
    var loader = new FBXLoader();

    loader.load(
	'../extern/models/lambo/Lamborghini_Aventador.fbx',
	function ( obj ) {
	    // Scale and add to the rig once loaded.
	    obj.scale.x = 0.01;
	    obj.scale.y = 0.01;
	    obj.scale.z = 0.01;
	    rig.add(obj);
	},
	function (xhr){
		console.log((xhr.loaded / xhr.total * 100) + '% loaded');
	},
	function (error){
		console.log('An error happened');
	}
    );

    // Pose exhibit.
    exhibit.rotation.y = THREE.Math.degToRad(-90);
    exhibit.position.z = -5;
    exhibit.position.x = 3;

    scene.add(exhibit);
}

function initExhibit3(userRig){

    // Exhibit 3 - Creates an interactive star mesh.
    var exhibit = new THREE.Group();
    exhibit.add(new USER.UserPlatform(userRig));

    // Parameters of star.
    var sides = 10;
    var r_outer = 1;
    var r_inner = .25;

    var mesh;

    function make_star(){
	// Clean up old one.
	if (mesh != undefined)
	    exhibit.remove(mesh);

	var angle = THREE.Math.degToRad(360 / sides);
	var half_angle = angle / 2;
	var geometry = new THREE.Geometry();

	// Make one triangle of star.
	var tri = [
	    new THREE.Vector3(0,r_outer,0),
    	    new THREE.Vector3(-r_inner * Math.sin(half_angle),
			      r_inner * Math.cos(half_angle),
			      0),
	    new THREE.Vector3(r_inner * Math.sin(half_angle),
			      r_inner * Math.cos(half_angle),
			      0)];
	// Rotate triangle about z-axis to make more triangles.
	var rot = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0,0,1), angle);
	for (var i = 0; i < sides; i++){
	    geometry.vertices.push(tri[0], tri[1], tri[2]);
	    geometry.faces.push(new THREE.Face3(i*3 + 0, i*3 + 1, i*3 + 2));
	    tri[0] = tri[0].clone().applyMatrix4(rot);
	    tri[1] = tri[1].clone().applyMatrix4(rot);
	    tri[2] = tri[2].clone().applyMatrix4(rot);
	}

	// Form mesh from geometry.
	var material = new THREE.MeshBasicMaterial({color: 0xFFFF00});
	mesh = new THREE.Mesh(geometry, material);

	// Pose mesh.
	mesh.position.y = 1.6;
	mesh.position.z = -5;
	exhibit.add(mesh);
    }

    make_star();

    // Make GUI sign.
    var buttons = [new GUIVR.GuiVRButton("sides", 3, 0, 100, true,
					 function(x){
					     sides = x;
					     make_star();}),
		   new GUIVR.GuiVRButton("r_outer", 1, 1, 5, false,
					 function(x){
					     r_outer = x;
					     make_star();}),
		   new GUIVR.GuiVRButton("r_inner", .25, 0, 5, false,
					 function(x){
					     r_inner = x;
					     make_star();
					 })];
    var sign = new GUIVR.GuiVRMenu(buttons);
    sign.position.x = 0;
    sign.position.z = -2;
    sign.position.y = 0.7;
    exhibit.add(sign);

    // Pose exhibit.
    exhibit.rotation.y = THREE.Math.degToRad(90);
    exhibit.position.z = -15;
    exhibit.position.x = -3;

    scene.add(exhibit);
}

function initExhibit4(userRig){

    // Exhibit 4 - Lighting
    var exhibit = new THREE.Group();
    exhibit.add(new USER.UserPlatform(userRig));

    // Create ground that can be shadowed.
    var groundGeo = new THREE.PlaneGeometry(6, 6);
    var groundMat = new THREE.MeshPhongMaterial({color: 0xaaaaaa});
    var ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = 0.001;
    ground.position.z = -5;
    ground.rotation.x = THREE.Math.degToRad(-90);
    ground.receiveShadow = true;
    exhibit.add(ground);

    // Create random blocks that shadow and can be shadowed.
    for (var i = 0; i < 30; i++){
	var m = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25),
			       new THREE.MeshPhongMaterial({color: 0xffffff}));
	m.castShadow = true;
	m.receiveShadow = true;
	m.position.x = Math.random() * 2 - 1;
	m.position.y = Math.random() * 2 + 0.25;
	m.position.z = Math.random() * 2 - 6;
	exhibit.add(m);
    }

    // Create a spot light.
    var light = new THREE.SpotLight(0xffffff, 1);
    light.target.position.z = -5;
    light.target.position.x = 0;
    light.target.position.y = 0;
    exhibit.add(light.target);
    light.position.x = 3;
    light.position.y = 3;
    light.position.z = -5;

    light.castShadow = true;
    light.animAngle = 0;
    light.setAnimation(
	function (dt) {
	    this.animAngle += 0.1 * dt;
	    this.position.x = 3 * Math.cos(this.animAngle);
	    this.position.z = -5 + 3 * Math.sin(this.animAngle);
	    shadowCamera.update();
	});
    animatedObjects.push(light);
    exhibit.add(light);

    // Create indicate to show position and angle of light.
    var shadowCamera = new THREE.CameraHelper(light.shadow.camera);
    scene.add(shadowCamera);


    var inited = false; // To keep button initialization below from moving the user.

    // Make GUI sign.
    var signRig = new THREE.Group();
    var buttons = [new GUIVR.GuiVRButton("y", 3, 2.5, 6, false,
					 function(x){
					     light.position.y = x;
					 }),
		   new GUIVR.GuiVRButton("angle", 45, 0, 90, false,
					 function(x){
					     light.angle = THREE.Math.degToRad(x);
					     shadowCamera.camera.fov = x;
					 }),
		   new GUIVR.GuiVRButton("far", 10, 0, 20, true,
					 function(x){
					     light.shadow.camera.far = x;
					     light.shadow.camera.updateProjectionMatrix();
					 }),
		   new GUIVR.GuiVRButton("1st person", 0, 0, 1, true,
					 function(x){
					     if (x == 0) {
						 userRig.position.y = 0;
						 if (inited){
						     exhibit.children[0].add(userRig);
						 }
						 exhibit.add(signRig);
					     } else {
						 userRig.position.y = -1.65;
						 shadowCamera.add(userRig);
						 userRig.add(signRig);
					     }
					 })
		  ];
    var sign = new GUIVR.GuiVRMenu(buttons);
    sign.position.x = 1;
    sign.position.z = -2;
    sign.position.y = 0.7;
    signRig.add(sign);
    inited = true;

    // Pose exhibit.
    exhibit.rotation.y = THREE.Math.degToRad(-90);
    exhibit.position.z = -15;
    exhibit.position.x = 3;

    scene.add(exhibit);
}

// Initialize THREE objects in the scene.
function initExhibits(userRig){

    // Use canvas to create texture for holodeck-inspired walls.
    var ctx = document.createElement('canvas').getContext('2d');
    ctx.canvas.width = 512;
    ctx.canvas.height = 512;
    ctx.fillStyle = '#EDD400';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(3, 3, ctx.canvas.width-6, ctx.canvas.height-6);
    var wallTexture = new THREE.CanvasTexture(ctx.canvas);
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.magFilter = THREE.LinearFilter;
    wallTexture.minFilter = THREE.LinearMipmapNearestFilter;
    wallTexture.repeat.set(100, 100);
    var wallMaterial = new THREE.MeshPhongMaterial();
    wallMaterial.map = wallTexture;

    // Create the floor.
    var floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(100, 100), wallMaterial);
    floor.geometry.rotateX(THREE.Math.degToRad(-90));
    floor.geometry.translate(0,0,0);
    scene.add(floor)

    // Create a light in the room.
    var light = new THREE.PointLight(0xffffff, 0.5);
    light.position.y = 20;
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xFFFFFF, 0.3));

    // Initialize the exhibits.
    initMovingBlocks(userRig);
    initFlyingSaucer(userRig);
    //initExhibit1(userRig);
    //initExhibit2(userRig);
    //initExhibit3(userRig);
    //initExhibit4(userRig);
}

function init() {

    // Set up renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);
    renderer.setClearColor(0x00BFFF, 1);

    // Extra settings to enable shadows.
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Create a scene
    scene = new THREE.Scene();

    // Create the main camera pointing at the board.
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight,
					 0.1, 50);
    camera.position.set(0, 1.6, 1);

    // Encapsulate user camera and controllers into a rig.
    userRig = new USER.UserRig(camera, renderer.xr);
    scene.add(userRig);

    // Create the contents of the room.
    initExhibits(userRig);

    // Add VR button.
    document.body.appendChild(VRButton.createButton(renderer));
    window.addEventListener('resize', onWindowResize, false);

    // Set handler for mouse clicks.
    window.onclick = onSelectStart;

    // Starts main rendering loop.
    renderer.setAnimationLoop(render);

}

// Event handler for controller clicks when in VR mode, and for mouse
// clicks outside of VR mode.
function onSelectStart(event){

    if (event instanceof MouseEvent && !renderer.xr.isPresenting()){
	// Handle mouse click outside of VR.
	// Determine screen coordinates of click.
	var mouse = new THREE.Vector2();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
	// Create raycaster from the camera through the click into the scene.
	var raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(mouse, camera);

	// Register the click into the GUI.
	GUIVR.intersectObjects(raycaster);
    }

}


// Update the camera aspect ratio when the window size changes.
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Updates world and renders one frame.
// Is repeatedly called by main rendering loop.
function render() {

    let dt = 0.1;
    // Force the gui to appear as heads up display tracking headset
    // position.
    for (let i = 0; i < animatedObjects.length; i++){
	animatedObjects[i].animate(dt);
    }
    userRig.animate(dt);

    renderer.render(scene, camera);
}

// Main program.
// Sets up everything.
init();
