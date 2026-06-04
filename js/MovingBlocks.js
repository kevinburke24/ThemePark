import * as THREE from '../extern/build/three.module.js';
import { VRButton } from '../extern/VRButton.js';
import {DebugConsole, debugWrite} from './DebugConsole.js';
import * as DEBUG from './DebugHelper.js';
import * as GUIVR from './GuiVR.js';
import * as ANIMATOR from './Animator.js';
import * as USER from './User.js';

// Constants determining size of text and window.
let NUM_LINES = 13;
let FONT_SIZE = 30;

let debugConsoles = [];
let debugOutput = "";
let score = 0;
let scoreOutput = "";

export class movingBlocks extends THREE.Group {
  constructor(user, scaleX, scaleY, scaleZ, difficulty){
    super();

    if (difficulty == "easy"){
      this.difficulty = 5;
    }

    else if (difficulty == "medium"){
      this.difficulty = 7;
    }

    else if (difficulty == "hard"){
      this.difficulty = 8;
    }

    var platform = new USER.UserPlatform(user);
    this.add(platform);
    platform.position.z = 0.5;
    this.scale.x = scaleX;
    this.scale.y = scaleY;
    this.scale.z = scaleZ;
    // Make a GUI sign.
    var speed1;
    var speed2;
    var speed3;
    var speed4;
    var buttons = [new GUIVR.GuiVRButton("Diff.", this.difficulty, 5, 8, true,
        function(x){speed1 = x/100; speed2 = x/100; speed3 = x/100; speed4 = x/100;})];
    var sign = new GUIVR.GuiVRMenu(buttons);
    sign.position.x = 0;
    sign.position.z = -2;
    sign.position.y = 1;
    this.add(sign);
    //user.add(sign);
    //Set up instructions board
    var instructionsBrd = new InstructionsBoard(2.5);
    debugConsoles.push(instructionsBrd);
    instructionsBrd.rotateX(THREE.Math.degToRad(10));
    instructionsBrd.position.x = 0;
    instructionsBrd.position.y = 4;
    instructionsBrd.position.z = -4;
    this.add(instructionsBrd);

    var scoreBoard = new ScoreBoard(1.5);
    debugConsoles.push(scoreBoard);
    scoreBoard.rotateX(THREE.Math.degToRad(10));
    scoreBoard.position.x = 3;
    scoreBoard.position.y = 4;
    scoreBoard.position.z = -3.5;
    this.add(scoreBoard);
    writeScore("You have halted " + score + " blocks");
    //Writing game directions to instruction board
    writeInstructions("Help expedite delivery!\n");
    writeInstructions("Web Instructions: To stop");
    writeInstructions("the boxes, use Quest tool");
    writeInstructions("'rotate' function to move");
    writeInstructions("controller\n");
    writeInstructions("If all blocks end up");
    writeInstructions("aligned, You Win!\n");
    writeInstructions("NOTE: Please use Oculus");
    writeInstructions("Quest in Imagine Lab\n");
    //writeInstructions("Score: " + score);

    var rightController = user.getController(0);
    var leftController = user.getController(1);
    //var NUM_BOXES = numBoxes;
    //var geometry = new THREE.BoxGeometry(1, 5, 1);
    var geometry = new THREE.BufferGeometry();

    function makeBox(xPos, yPos, zPos){
      const vertices = [
          // front
          { pos: [-1, -1,  1], norm: [ 0,  0,  1], uv: [0, 1], }, // 0
          { pos: [ 0, -1,  1], norm: [ 0,  0,  1], uv: [1, 1], }, // 1
          { pos: [-1,  1.5,  1], norm: [ 0,  0,  1], uv: [0, 0], }, // 2
          { pos: [ 0,  1.5,  1], norm: [ 0,  0,  1], uv: [1, 0], }, // 3
          // right
          { pos: [ 0, -1,  1], norm: [ 1,  0,  0], uv: [0, 1], }, // 4
          { pos: [ 0, -1, -1], norm: [ 1,  0,  0], uv: [1, 1], }, // 5
          { pos: [ 0,  1.5,  1], norm: [ 1,  0,  0], uv: [0, 0], }, // 6
          { pos: [ 0,  1.5, -1], norm: [ 1,  0,  0], uv: [1, 0], }, // 7
          // back
          { pos: [ 0, -1, -1], norm: [ 0,  0, -1], uv: [0, 1], }, // 8
          { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 1], }, // 9
          { pos: [ 0,  1.5, -1], norm: [ 0,  0, -1], uv: [0, 0], }, // 10
          { pos: [-1,  1.5, -1], norm: [ 0,  0, -1], uv: [1, 0], }, // 11
          // left
          { pos: [-1, -1, -1], norm: [-1,  0,  0], uv: [0, 1], }, // 12
          { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 1], }, // 13
          { pos: [-1,  1.5, -1], norm: [-1,  0,  0], uv: [0, 0], }, // 14
          { pos: [-1,  1.5,  1], norm: [-1,  0,  0], uv: [1, 0], }, // 15
          // top
          { pos: [ 0,  1.5, -1], norm: [ 0,  1,  0], uv: [0, 1], }, // 16
          { pos: [-1,  1.5, -1], norm: [ 0,  1,  0], uv: [1, 1], }, // 17
          { pos: [ 0,  1.5,  1], norm: [ 0,  1,  0], uv: [0, 0], }, // 18
          { pos: [-1,  1.5,  1], norm: [ 0,  1,  0], uv: [1, 0], }, // 19
          // bottom
          { pos: [ 0, -1,  1], norm: [ 0, -1,  0], uv: [0, 1], }, // 20
          { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 1], }, // 21
          { pos: [ 0, -1, -1], norm: [ 0, -1,  0], uv: [0, 0], }, // 22
          { pos: [-1, -1, -1], norm: [ 0, -1,  0], uv: [1, 0], }, // 23
        ];

        const positions = [];
        const normals = [];
        const uvs = [];
        for (const vertex of vertices) {
          positions.push(...vertex.pos);
          normals.push(...vertex.norm);
          uvs.push(...vertex.uv);
        }

        const positionNumComponents = 3;
        const normalNumComponents = 3;
        const uvNumComponents = 2;
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
        geometry.setAttribute(
            'normal',
            new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
        geometry.setAttribute(
            'uv',
            new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));

        geometry.setIndex([
           0,  1,  2,   2,  1,  3,
           4,  5,  6,   6,  5,  7,
           8,  9, 10,  10,  9, 11,
          12, 13, 14,  14, 13, 15,
          16, 17, 18,  18, 17, 19,
          20, 21, 22,  22, 21, 23,
        ]);

      const loader = new THREE.TextureLoader();
      const texture = loader.load('crate.jpg');
      var material = new THREE.MeshBasicMaterial({map: texture});
      var movingBox = new THREE.Mesh(geometry, material);
      //this.add(movingBox);
      movingBox.position.x = xPos;
      movingBox.position.y = yPos;
      movingBox.position.z = zPos;
      return movingBox;
    }

    let box1 = makeBox(-3, 1, -5);
    let box2 = makeBox(-1, 1, -5);
    let box3 = makeBox(1, 1, -5);
    let box4 = makeBox(3, 1, -5);

    this.boxHit1 = false;
    this.boxHit2 = false;
    this.boxHit3 = false;
    this.boxHit4 = false;

    this.add(box1);
    this.add(box2);
    this.add(box3);
    this.add(box4);

    //let negShift1 = -this.speed;
    //let posShift1 = this.speed;
    //let negShift2 = -this.speed;
    //let posShift2 = this.speed;
    var stop1 = false;
    var stop2 = false;
    var stop3 = false;
    var stop4 = false;

    let count = 75;
    box1.setAnimation(
      function(dt){
        if (!stop1){
          count -= 1;
          if (count <= 0){
            count = 75;
            speed1 *= -1;
          }
          this.position.z -= speed1;
        }
      }
    );

    let count2 = 75;
    box2.setAnimation(
      function(dt){
        if (!stop2){
          count2 -= 1;
          if (count2 <= 0){
            count2 = 75;
            speed2 *= -1;
          }
          this.position.z += speed2;//posShift1;
        }
      }
    );

    let count3 = 75;
    box3.setAnimation(
      function(dt){
        if (!stop3){
          count3 -= 1;
          if (count3 <= 0){
            count3 = 75;
            speed3 *= -1;
          }
          this.position.z -= speed3;
        }
      }
    );

    let count4 = 75;
    box4.setAnimation(
      function(dt){
        if (!stop4){
          count4 -= 1;
          if (count4 <= 0){
            count4 = 75;
            speed4 *= -1;
          }
          this.position.z += speed4;
        }
      }
    );

    leftController.setAnimation(
      function(dt){
        if (this.triggered && ((this.position.x >= box1.position.x - 0.8 && this.position.x <= box1.position.x + 0.8))){
            console.log(this.position.z);
            console.log(box1.position.z);
            console.log(this.position.x);
            console.log(box1.position.x);
          stop1 = true;
          this.triggered = false;

          if (hasWon()){
            scoreBoard.clear();
            writeScore("YOU WIN");
            return;
          }

          if (stop1 && stop2 && stop3 && stop4){
            scoreBoard.clear();
            writeScore("YOU LOST");
            return;
          }

          else if (!this.boxHit1){
            score += 1;
            scoreBoard.clear();
            writeScore("You have halted " + score + " blocks");
          }
          this.boxHit1 = true;
        }

        if (this.triggered && ((this.position.x <= box2.position.x + 0.57 && this.position.x >= box2.position.x - 0.57))){
            console.log(this.position.x);
            console.log(box2.position.x);
          stop2 = true;
          this.triggered = false;

          if (hasWon()){
            scoreBoard.clear();
            writeScore("YOU WIN");
            return;
          }

          if (stop1 && stop2 && stop3 && stop4){
            scoreBoard.clear();
            writeScore("YOU LOST");
            return;
          }

          if (!this.boxHit2){
            score += 1;
            scoreBoard.clear();
            writeScore("You have halted " + score + " blocks");
          }

          this.boxHit2 = true;
        }

        if (this.triggered && ((this.position.x >= box3.position.x - 0.57 && this.position.x <= box3.position.x + 0.57))){
            stop3 = true;
            this.triggered = false;
            if (hasWon())
            {
              scoreBoard.clear();
              writeScore("YOU WIN");
              return;
            }
            if (stop1 && stop2 && stop3 && stop4)
            {
              scoreBoard.clear();
              writeScore("YOU LOST");
              return;
            }
            if (!this.boxHit3)
            {
              score += 1;
              scoreBoard.clear();
              writeScore("You have halted " + score + " blocks");
            }
            this.boxHit3 = true;
          }

        if (this.triggered && ((this.position.x <= box4.position.x + 0.8 && this.position.x >= box4.position.x - 0.8))){
            stop4 = true;
            this.triggered = false;
            if (hasWon()){
              scoreBoard.clear();
              writeScore("YOU WIN");
              return;
            }
            if (stop1 && stop2 && stop3 && stop4){
              scoreBoard.clear();
              writeScore("YOU LOST");
              return;
            }
            if (!this.boxHit4){
              score += 1;
              scoreBoard.clear();
              writeScore("You have halted " + score + " blocks");
            }
            this.boxHit4 = true;
          }

      }
    );

    rightController.setAnimation(
      function(dt){
        if (this.triggered && (this.position.x >= box1.position.x - 0.57 && this.position.x <= box1.position.x + 0.57)){
            stop1 = true;
            this.triggered = false;
            if (hasWon()){
              scoreBoard.clear();
              writeScore("YOU WIN");
              return;
            }
            if (stop1 && stop2 && stop3 && stop4){
              scoreBoard.clear();
              writeScore("YOU LOST");
              return;
            }
            if (!this.boxHit1){
              score += 1;
              scoreBoard.clear();
              writeScore("You have halted " + score + " blocks");
            }
            this.boxHit1 = true;
        }

        if (this.triggered && ((this.position.x >= box2.position.x - 0.57 && this.position.x <= box2.position.x + 0.57))){
            console.log(this.position.z);
            console.log(box2.position.z);
            stop2 = true;
            this.triggered = false;
            if (hasWon()){
              scoreBoard.clear();
              writeScore("YOU WIN");
              return;
            }
            if (stop1 && stop2 && stop3 && stop4){
              scoreBoard.clear();
              writeScore("YOU LOST");
              return;
            }
            if (!this.boxHit2){
              console.log('fff');
              score += 1;
              scoreBoard.clear();
              writeScore("You have halted " + score + " blocks");
            }
            this.boxHit2 = true;
        }

        if (this.triggered && ((this.position.x >= box3.position.x - 0.7 && this.position.x <= box3.position.x + 0.7))){
            stop3 = true;
            this.triggered = false;
            if (hasWon()){
              scoreBoard.clear();
              writeScore("YOU WIN");
              return;
            }
            if (stop1 && stop2 && stop3 && stop4){
              scoreBoard.clear();
              writeScore("YOU LOST");
              return;
            }
            if (!this.boxHit3){
              score += 1;
              scoreBoard.clear();
              writeScore("You have halted " + score + " blocks");
            }
            this.boxHit3 = true;
          }

        if (this.triggered && ((this.position.x >= box4.position.x - 0.7 && this.position.x <= box4.position.x + 0.7))){
            stop4 = true;
            this.triggered = false;
            if (hasWon()){
              scoreBoard.clear();
              writeScore("YOU WIN");
              return;
            }
            if (stop1 && stop2 && stop3 && stop4){
              scoreBoard.clear();
              writeScore("YOU LOST");
              return;
            }
            if (!this.boxHit4){
              score += 1;
              scoreBoard.clear();
              writeScore("You have halted " + score + " blocks");
            }
            this.boxHit4 = true;
          }
      }
    );

    function hasWon(){
      if (stop1 && stop2 && stop3 && stop4){
        console.log(box1.position.z);
        console.log(box2.position.z);
        if (Math.max(box1.position.z, Math.max(box2.position.z, Math.max(box3.position.z, box4.position.z)))
         - Math.min(box1.position.z, Math.min(box2.position.z, Math.min(box3.position.z, box4.position.z))) <= 0.8){
          return true;
        }
      }
      return false;
    }


  }
}

// Writes msg to all active DebugConsoles.  Scrolls if lines more than
// NUM_LINES.  Overlong lines are cropped when displayed.
export function writeInstructions(msg){
    debugOutput += msg + "\n";

    // Determine the lines of text that appear.
    var lines = debugOutput.split('\n');
    lines = lines.slice(-NUM_LINES-1, -1);
    debugOutput = lines.join("\n") + "\n";
    //update display of instructions board
    debugConsoles[0].updateTexture();
    // Update the display of all DebugConsoles.
    //for (var i = 0; i < debugConsoles.length; i++){
	//debugConsoles[i].updateTexture();
    //}
}

function writeScore(msg){
  scoreOutput = msg;

  // Determine the lines of text that appear.
  //var lines = scoreOutput.split('\n');
  //lines = lines.slice(-NUM_LINES-1, -1);
  //scoreOutput = lines.join("\n") + "\n";
  //update display of instructions board
  for (var i = 2; i < debugConsoles.length; i++){
    debugConsoles[i].updateTexture();
  }
}

//Class for displaying score
class ScoreBoard extends GUIVR.GuiVR{
  // Creates a new instance with the specified width in world units.
  constructor(w){
	super();

	// Determine world dimensions of consoles.
	this.w = w;
	this.h = 0.09 * NUM_LINES;

	// Create canvas that will display the output.
	this.ctx = document.createElement('canvas').getContext('2d');
	this.ctx.canvas.width = 512;
	this.ctx.canvas.height = 512;
	// Create texture from canvas.
	this.texture = new THREE.CanvasTexture(this.ctx.canvas);
	this.texture.magFilter = THREE.LinearFilter;
	this.texture.minFilter = THREE.LinearFilter;
	this.updateTexture();
	// Create rectangular mesh textured with output that is displayed.
	var c = new THREE.Mesh(new THREE.PlaneBufferGeometry(this.w, this.h),
			       new THREE.MeshBasicMaterial({map: this.texture}));
	this.add(c);
	// Set the console's rectangle to collider as a gui element.
	this.collider = c;

	// Make a fancy 3D label "Console" at the top.
  var loader = new THREE.FontLoader();
	var current = this;
	loader.load( '../extern/fonts/helvetiker_bold.typeface.json', function ( font ) {
	    var textGeo = new THREE.TextBufferGeometry( "Progress", {
		font: font,
		size: 0.1,
		height: 0.02,
		curveSegments: 3,
	    } );
	    var textMaterial = new THREE.MeshPhongMaterial( { color: 0xad7fa8, specular: 0x111111 } );
	    var debug_mesh = new THREE.Mesh( textGeo, textMaterial );
	    debug_mesh.position.x = -current.w / 2 + 0.02;
	    debug_mesh.position.y = current.h / 2 + 0.03;
	    debug_mesh.position.z = 0.01;
	    current.add(debug_mesh);
	});

	// Register in a list of all the debugConsoles created so that
	// new output can be mirrored to all.
	debugConsoles.push(this);
    }

    // Update the texture of this board to match the current debugOutput.
    updateTexture(){
	var ctx = this.ctx;
	// Clear the canvas.
	ctx.fillStyle = '#AA00AA';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.fillStyle = '#AAAAAA';
	ctx.fillRect(2, 2, ctx.canvas.width-4, ctx.canvas.height-4);
	// Display the output.
	ctx.fillStyle = '#000000';
	ctx.font = "bold " + FONT_SIZE.toString() + "px Courier";
	//var lines = scoreOutput.split('\n');
  ctx.fillText(scoreOutput, 5, FONT_SIZE + FONT_SIZE * 1.25);
	//for (var i = 0; i < lines.length; i++){
	//   ctx.fillText(lines[i], 15, FONT_SIZE + FONT_SIZE * 1.25 * i);
	//}
	// Force the renderer to update the texture.
	this.texture.needsUpdate = true;
    }

    // Click handler, resets all DebugConsoles.
    collide(uv, pt){
	this.clear();
    }

    // Resets all DebugConsoles.
    clear(){
	// Empty debugOutput.
  scoreOutput = "";
	//score = 0;
	// Update the display of all DebugConsoles.
	//for (var i = 0; i < debugConsoles.length; i++){
	 //   debugConsoles[i].updateTexture();
	//}
  debugConsoles[2].updateTexture();

    }

}

// Class for displaying instructions in VR
class InstructionsBoard extends GUIVR.GuiVR {

  // Creates a new instance with the specified width in world units.
  constructor(w){
	super();

	// Determine world dimensions of consoles.
	this.w = w;
	this.h = 0.14 * NUM_LINES;

	// Create canvas that will display the output.
	this.ctx = document.createElement('canvas').getContext('2d');
	this.ctx.canvas.width = 512;
	this.ctx.canvas.height = 550;
	// Create texture from canvas.
	this.texture = new THREE.CanvasTexture(this.ctx.canvas);
	this.texture.magFilter = THREE.LinearFilter;
	this.texture.minFilter = THREE.LinearFilter;
	this.updateTexture();
	// Create rectangular mesh textured with output that is displayed.
	var c = new THREE.Mesh(new THREE.PlaneBufferGeometry(this.w, this.h),
			       new THREE.MeshBasicMaterial({map: this.texture}));
	this.add(c);
	// Set the console's rectangle to collider as a gui element.
	this.collider = c;

	// Make a fancy 3D label "Console" at the top.
    	var loader = new THREE.FontLoader();
	var current = this;
	loader.load( '../extern/fonts/helvetiker_bold.typeface.json', function ( font ) {
	    var textGeo = new THREE.TextBufferGeometry( "Instructions", {
		font: font,
		size: 0.1,
		height: 0.02,
		curveSegments: 3,
	    } );
	    var textMaterial = new THREE.MeshPhongMaterial( { color: 0xad7fa8, specular: 0x111111 } );
	    var debug_mesh = new THREE.Mesh( textGeo, textMaterial );
	    debug_mesh.position.x = -current.w / 2 + 0.02;
	    debug_mesh.position.y = current.h / 2 + 0.03;
	    debug_mesh.position.z = 0.01;
	    current.add(debug_mesh);
	});

	// Register in a list of all the debugConsoles created so that
	// new output can be mirrored to all.
	debugConsoles.push(this);
    }

    // Update the texture of this board to match the current debugOutput.
    updateTexture(){
	var ctx = this.ctx;
	// Clear the canvas.
	ctx.fillStyle = '#AA00AA';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.fillStyle = '#AAAAAA';
	ctx.fillRect(2, 2, ctx.canvas.width-4, ctx.canvas.height-4);
	// Display the output.
	ctx.fillStyle = '#000000';
	ctx.font = "bold " + FONT_SIZE.toString() + "px Courier";
	var lines = debugOutput.split('\n');
	for (var i = 0; i < lines.length; i++){
	    ctx.fillText(lines[i], 15, FONT_SIZE + FONT_SIZE * 1.25 * i);
	}
	// Force the renderer to update the texture.
	this.texture.needsUpdate = true;
    }

    // Click handler, resets all DebugConsoles.
    collide(uv, pt){
	this.clear();
    }

    // Resets all DebugConsoles.
    clear(){
	// Empty debugOutput.
	debugOutput = "";
	// Update the display of all DebugConsoles.
	//for (var i = 0; i < debugConsoles.length; i++){
	//    debugConsoles[i].updateTexture();
	//}

  debugConsoles[0].updateTexture();

    }

}





    /**
    //this.user = user;
    var IMG_MACHINE = "https://res.cloudinary.com/rmarcello/image/upload/v1433512041/slot-machine_orizontal_ygxsnm.png";
    var NUM_SLOTS=3;

    var meshes;
    var bodyMesh;

    //var cont = //this.user.getController(1);
    //this.controller = user.getController(1);
    //this.controller.position.setFromMatrixPosition(this.controller.matrixWorld);


    //initSlot();
    //animate();
    //var controller = userRig.getController(1);
    //et tempMatrix = new THREE.Matrix4();
    //tempMatrix.identity().extractRotation(controller.matrixWorld);
    //eventHandler();
    var frameGeometry = new THREE.BoxGeometry( 6, 4, 1 );
    var frameMaterial = new THREE.MeshBasicMaterial( { color: 'brown' } );
    var frameMesh = new THREE.Mesh( frameGeometry, frameMaterial );
    frameMesh.position.x=1;
    frameMesh.position.y=1;
    frameMesh.position.z= -8.5;
    this.add(frameMesh);

    let lever = createLever();
    this.leverBox = createLeverBox();
    frameMesh.add(this.leverBox);
    this.leverBox.add(lever);

    var geometry = new THREE.CylinderGeometry( 1, 1, 1, 32 );
    var material = createSlotElementMaterial();
    this.meshes=[];
    //meshes[i].rotateX(THREE.Math.degToRad(100));
    //scene.add(meshes[i]);

    for(var i=0; i< NUM_SLOTS ; i++) {
        this.meshes[i] = new THREE.Mesh(geometry, material);
        this.meshes[i].position.x = i - 1.85;
        this.meshes[i].position.z = 1;
        this.meshes[i].position.y = 0.5;
        this.meshes[i].rotation.z = Math.PI/2;
        this.meshes[i].rotation.x = 0.5;
        frameMesh.add(this.meshes[i]);
        //meshes[i].rotateX(THREE.Math.degToRad(100));
        //scene.adlever.position.setFromMatrixPosition(thisd( meshes[i] );
    }

    var trig = false;
    let controller = user.getController(0);
    console.log(this.leverBox.rotation.x);
    //console.log(controller.getWorldPosition());
    controller.position.setFromMatrixPosition(controller.matrixWorld);
    //lever.position.setFromMatrixPosition(lever.matrixWorld);
    this.leverBox.updateMatrixWorld();
    var vector = new THREE.Vector3();
    vector.setFromMatrixPosition(lever.matrixWorld);
    this.leverBox.setAnimation(
      function(dt){
        //controller.rotation.setFromMatrixPosition(controller.matrixWorld);
        if (trig && !controller.triggered){
          this.rotation.x = 0;
        }
        if (controller.rotation.y <= lever.position.x + 0.45  && controller.rotation.y >= lever.position.x - 0.45 && controller.triggered){
          console.log('fff');
          this.rotation.x = 0.66;
          trig = true;
        }
      }
    );

    for (var i = 0; i < NUM_SLOTS; i++){
      this.meshes[i].rotation.x = 200;
      this.meshes[i].setAnimation(
        function(i){
          if (controller.rotation.y <= -.20 && controller.rotation.y >= -.30 && controller.triggered){
            this.rotation.x *= 0.99;
          }
        }
        );

    }

    //slot machine frame
    //bodyMesh.rotateY(THREE.Math.degToRad(90));
    //scene.add( frameMesh );
    //var pivot = new THREE.Object3D();
    //var lever = new USER.Lever(userRig);

    this.leverBox.position.x = 2;
    this.leverBox.position.z = 1;
    this.leverBox.position.y = 0.5;
    lever.position.y += 0.95;
    lever.position.z += 2;
    lever.position.x += 0.5;
    //leverBox.add(lever);
    //pivot.add(lever);
    //scene.add(leverBox);
    //this.meshes[0].rotation.x = 200;
    //this.meshes[1].rotation.x = 300;
    //this.meshes[2].rotation.x = 100;


    //var exhibit = new THREE.Group();



  function createLeverBox(){
      const boxVertices = [

        // front
      { pos: [-1, -1,  1], norm: [ 0,  0,  1], uv: [0, 1], }, //botom left
      { pos: [0, -1,  1], norm: [ 0,  0,  1], uv: [1, 1], }, //bottom right
      { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 0], }, //top left

      { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 0], }, //top left
      { pos: [ 0, -1,  1], norm: [ 0,  0,  1], uv: [1, 1], }, //bottom right
      { pos: [ 0,  1,  1], norm: [ 0,  0,  1], uv: [1, 0], }, //top right
      // right
      { pos: [ 1, -1,  1], norm: [ 1,  0,  0], uv: [0, 1], },
      { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 1], },
      { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 0], },

      { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 0], },
      { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 1], },
      { pos: [ 1,  1, -1], norm: [ 1,  0,  0], uv: [1, 0], },
      // back
      { pos: [ 1, -1, -1], norm: [ 0,  0, -1], uv: [0, 1], },
      { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 1], },
      { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 0], },

      { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 0], },
      { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 1], },
      { pos: [-1,  1, -1], norm: [ 0,  0, -1], uv: [1, 0], },
      // left
      { pos: [-1, -1, -1], norm: [-1,  0,  0], uv: [0, 1], },
      { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 1], },
      { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 0], },

      { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 0], },
      { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 1], },
      { pos: [-1,  1,  1], norm: [-1,  0,  0], uv: [1, 0], },
      // top
      { pos: [ 1,  1, -1], norm: [ 0,  1,  0], uv: [0, 1], },
      { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 1], },
      { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 0], },

      { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 0], },
      { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 1], },
      { pos: [-1,  1,  1], norm: [ 0,  1,  0], uv: [1, 0], },
      // bottom
      { pos: [ 1, -1,  1], norm: [ 0, -1,  0], uv: [0, 1], },
      { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 1], },
      { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 0], },

      { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 0], },
      { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 1], },
      { pos: [-1, -1, -1], norm: [ 0, -1,  0], uv: [1, 0], },

      ];


      const positions = [];
      const normals = [];
      const uvs = [];
      for (const vertex of boxVertices) {
        positions.push(...vertex.pos);
        normals.push(...vertex.norm);
        uvs.push(...vertex.uv);
      }

      const geometry = new THREE.BufferGeometry();
      const positionNumComponents = 3;
      const normalNumComponents = 3;
      const uvNumComponents = 2;
      geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
      geometry.setAttribute(
          'normal',
          new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
      geometry.setAttribute(
          'uv',
          new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));

      const material = new THREE.MeshPhongMaterial({color: new THREE.Color('silver')});
      var leverBox = new THREE.Mesh(geometry, material);
      //scene.add(leverBox);
      leverBox.position.x = 3.33;
      leverBox.position.z = -7.55;
      leverBox.position.y = 1.55;
      return leverBox;
    }

    function createLever(){
      const leverVertices = [
        // front
      { pos: [-1, -1,  -0.6], norm: [ 0,  0,  1], uv: [0, 1], }, //bottom left
      { pos: [-0.8, -1,  -0.6], norm: [ 0,  0,  1], uv: [1, 1], }, //bottom right
      { pos: [-1,  -0.8,  -0.6], norm: [ 0,  0,  1], uv: [0, 0], }, //top left

      { pos: [-1,  -0.8,  -0.6], norm: [ 0,  0,  1], uv: [0, 0], }, //top left
      { pos: [ -0.8, -1,  -0.6], norm: [ 0,  0,  1], uv: [1, 1], }, //bottom right
      { pos:[ -0.8,  -0.8,  -0.6], norm: [ 0,  0,  1], uv: [1, 0], }, //top right
      // right
      { pos: [ -0.8, -1,  -0.6], norm: [ 1,  0,  0], uv: [0, 1], },
      { pos: [ -0.8, -1, -1], norm: [ 1,  0,  0], uv: [1, 1], },
      { pos: [ -0.8,  -0.8, -0.6], norm: [ 1,  0,  0], uv: [0, 0], },

      { pos: [ -0.8, -0.8,  -0.6], norm: [ 1,  0,  0], uv: [0, 0], },
      { pos: [ -0.8, -1, -1], norm: [ 1,  0,  0], uv: [1, 1], },
      { pos: [ -0.8, -0.8, -1], norm: [ 1,  0,  0], uv: [1, 0], },
      // back
      { pos: [ -0.8, -1, -1], norm: [ 0,  0, -1], uv: [0, 1], },
      { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 1], },
      { pos: [ -0.8,  1, -1], norm: [ 0,  0, -1], uv: [0, 0], },

      { pos: [ -0.8,  -0.8, -1], norm: [ 0,  0, -1], uv: [0, 0], },
      { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 1], },
      { pos: [-1,  -0.8, -1], norm: [ 0,  0, -1], uv: [1, 0], },
      // left
      { pos: [-1, -1, -1], norm: [-1,  0,  0], uv: [0, 1], },
      { pos: [-1, -1,  -0.6], norm: [-1,  0,  0], uv: [1, 1], },
      { pos: [-1,  -0.8, -1], norm: [-1,  0,  0], uv: [0, 0], },

      { pos: [-1,  -0.8, -1], norm: [-1,  0,  0], uv: [0, 0], },
      { pos: [-1, -1,  -0.6], norm: [-1,  0,  0], uv: [1, 1], },
      { pos: [-1,  -0.8,  -0.6], norm: [-1,  0,  0], uv: [1, 0], },
      // top
      { pos: [ -0.8,  -0.8, -1], norm: [ 0,  1,  0], uv: [0, 1], },
      { pos: [-1,  -0.8, -1], norm: [ 0,  1,  0], uv: [1, 1], },
      { pos: [ -0.8,  -0.8,  -0.6], norm: [ 0,  1,  0], uv: [0, 0], },

      { pos: [ -0.8,  -0.8,  -0.6], norm: [ 0,  1,  0], uv: [0, 0], },
      { pos: [-1,  -0.8, -1], norm: [ 0,  1,  0], uv: [1, 1], },
      { pos: [-1,  -0.8,  -0.6], norm: [ 0,  1,  0], uv: [1, 0], },
      // bottom
      { pos: [ -0.8, -1,  -0.6], norm: [ 0, -1,  0], uv: [0, 1], },
      { pos: [-1, -1,  -0.6], norm: [ 0, -1,  0], uv: [1, 1], },
      { pos: [ -0.8, -1, -1], norm: [ 0, -1,  0], uv: [0, 0], },

      { pos: [ -0.8, -1, -1], norm: [ 0, -1,  0], uv: [0, 0], },
      { pos: [-1, -1,  -0.6], norm: [ 0, -1,  0], uv: [1, 1], },
      { pos: [-1, -1, -1], norm: [ 0, -1,  0], uv: [1, 0], },
      ]

      const positions = [];
      const normals = [];
      const uvs = [];
      for (const vertex of leverVertices) {
        positions.push(...vertex.pos);
        normals.push(...vertex.norm);
        uvs.push(...vertex.uv);
      }

      const geometry = new THREE.BufferGeometry();
      const positionNumComponents = 3;
      const normalNumComponents = 3;
      const uvNumComponents = 2;
      geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
      geometry.setAttribute(
          'normal',
          new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
      geometry.setAttribute(
          'uv',
          new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));

      const material = new THREE.MeshPhongMaterial({color: new THREE.Color('blue')});
      var lever = new THREE.Mesh(geometry, material);
      //scene.add(lever);
      return lever;
    }

    function createSlotElementMaterial() {
          THREE.ImageUtils.crossOrigin = '';
    var t = THREE.ImageUtils.loadTexture( IMG_MACHINE );// "slot-machine.png"
          t.wrapS = THREE.RepeatWrapping;
          t.wrapT = THREE.RepeatWrapping;
          //t.offset.x = 90/(2*Math.PI);
    var m = new THREE.MeshBasicMaterial();
    m.map = t;
    return m;
    }
    */
