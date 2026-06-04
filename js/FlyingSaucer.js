// Author: Kevin Burke
// CSC 385 Computer Graphics
// Version: Winter 2020
// Project 2: Flying Saucer class
// Initializes scene, VR system, and event handlers.

import * as THREE from '../extern/build/three.module.js';
import * as USER from './User.js';
import * as GUIVR from './GuiVR.js';

export class FlyingSaucer extends THREE.Group{
  constructor(user, height, lightColor){
    super();

    var plat = new USER.UserPlatform(user);
    this.add(plat);
    plat.position.z = this.position.z + 7.5;
    //this.xPos = xPos;
    //this.zPos = zPos;
    this.height = height;

    this.lightColor = lightColor;
    // base = new USER.RideBase(userRig);
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, this.height, 32), new THREE.MeshPhongMaterial({color: 0x0000FF}));
    this.add(base);
    //ride.position.set(0, 0, 0);

    // Add saucer platform

    var saucer1 = new Saucer(user);
    var saucer2 = new Saucer(user);
    var saucer3 = new Saucer(user);
    var saucer4 = new Saucer(user);

    var beam1 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 4.5, 30, 32), new THREE.MeshPhongMaterial({color: this.lightColor, opacity:0.5, transparent:true, side:THREE.DoubleSide}));
    var beamPivot1 = new THREE.Object3D();
    saucer1.add(beam1);
    saucer1.add(beamPivot1);
    beamPivot1.add(beam1);
    beam1.position.set(0, -16, 0);

    var beam2 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 4.5, 30, 32), new THREE.MeshPhongMaterial({color: this.lightColor, opacity:0.5, transparent:true, side:THREE.DoubleSide}));
    var beamPivot2 = new THREE.Object3D();
    saucer2.add(beam2);
    saucer2.add(beamPivot2);
    beamPivot2.add(beam2);
    beam2.position.set(0, -15.5, 0);

    var beam3 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 4.5, 30, 32), new THREE.MeshPhongMaterial({color: this.lightColor, opacity:0.5, transparent:true, side:THREE.DoubleSide}));
    var beamPivot3 = new THREE.Object3D();
    saucer3.add(beam3);
    saucer3.add(beamPivot3);
    beamPivot3.add(beam3);
    beam3.position.set(0, -15.5, 0);

    var beam4 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 3, 30, 32), new THREE.MeshPhongMaterial({color: this.lightColor, opacity:0.5, transparent:true, side:THREE.DoubleSide}));
    var beamPivot4 = new THREE.Object3D();
    saucer4.add(beam4);
    saucer4.add(beamPivot4);
    beamPivot4.add(beam4);
    beam4.position.set(0, -15.5, 0);

    var extension1 = new THREE.Mesh(new THREE.BoxGeometry(5, 0.35, 0.45), new THREE.MeshPhongMaterial({color: 0x0000FF}));
    var extension2 = extension1.clone();
    var extension3 = extension1.clone();
    var extension4 = extension1.clone();

    base.add(extension1);
    base.add(extension2);
    base.add(extension3);
    base.add(extension4);
    extension1.rotateY(THREE.Math.degToRad(90));
    extension1.position.set(0, 0, 3);
    //extension2.rotateY(THREE.Math.degToRad(90));
    extension2.position.set(-3, 0, 0);
    extension3.position.set(3, 0, 0);
    //extension3.rotateOnAxis(new THREE.Vector3(0,0,0), THREE.Math.degToRad(45));
    extension4.rotateY(THREE.Math.degToRad(90));
    extension4.position.set(0, 0, -3);
    //extension3.rotateY(THREE.Math.degToRad(45));
    //extension3.position.set(base.position.x, 2.5, base.position.z);
    //extension3.position.set(base.position.x - 3, 2.5, base.position.z);
    //extension3.rotateOnAxis(base.position, THREE.Math.degToRad(45));
    //extension2.position.x = 5 * Math.cos(THREE.Math.degToRad(45));
    //extension2.rotateY(THREE.Math.degToRad(45))
    //base.add(saucer1);
    extension1.add(saucer1);
    extension2.add(saucer2);
    extension3.add(saucer3);
    extension4.add(saucer4);

    //saucer.platform.rotateOnAxis(base.position, THREE.Math(degToRad(theta+45)))
    //saucer1.rotation.y = THREE.Math.degToRad(-90);
    saucer1.speed = 0.5; // new member variable to track speed
    //saucer1.position.z = -5;
    saucer1.position.x -= 3;
    saucer1.rotateY(THREE.Math.degToRad(-135));
    saucer2.position.x -= 3;
    saucer2.rotateY(THREE.Math.degToRad(-120));
    saucer3.position.x += 3;
    saucer3.rotateY(THREE.Math.degToRad(45));
    saucer4.position.x += 3;
    saucer4.rotateY(THREE.Math.degToRad(60));

    var light1 = new THREE.SpotLight('white', 1, -5, THREE.Math.degToRad(60), 0.8);
    var light2 = new THREE.SpotLight('white', 1, -5, THREE.Math.degToRad(60), 0.8);
    var light3 = new THREE.SpotLight('white', 1, -5, THREE.Math.degToRad(60), 0.8);
    var light4 = new THREE.SpotLight('white', 1, -5, THREE.Math.degToRad(60), 0.8);
    //light.position.set(saucer1.position.x, saucer1.position.y, saucer1.position.z);

    //scene.add(light1);
    //scene.add(light2);
    //scene.add(light3);
    //scene.add(boxMesh);
    //scene.add(light4);

    //light.position.x = saucer1.position.x;
    //light.position.y = saucer1.position.y;
    //light.position.z = saucer1.position.z;

    light1.target.position.z = 2;
    light1.target.position.x = 0;
    light1.target.position.y = -5;

    light2.target.position.z = -5;

    saucer1.add(light1);
    saucer2.add(light2);
    saucer3.add(light3);
    saucer4.add(light4);//((20+5)*i) - 30;

    //saucer3.position.x = extension3.position.x;
    //saucer1.position.y = 1;

    var down = false;
    var beamDown = false;

    var pivot1 = new THREE.Object3D();
    var pivot2 = new THREE.Object3D();
    var pivot3 = new THREE.Object3D();
    var pivot4 = new THREE.Object3D();

    base.add(pivot1);
    base.add(pivot2);
    base.add(pivot3);
    base.add(pivot4);
    pivot1.add(extension1);
    pivot2.add(extension2);
    pivot3.add(extension3);
    pivot4.add(extension4);

    //pivot1.add(extension3);
    //pivot1.add(extension4);
    //pivot1.speed = 0.1;
    pivot1.position.z = 0;
    pivot1.position.y = (this.height/2) - 0.033;
    pivot1.position.x = 0;
    //pivot1.rotation.speed = 0.01;

    pivot2.position.z = 0;
    pivot2.position.y = (this.height/2) - 0.033;
    pivot2.position.x = 0;

    pivot3.position.z = 0;
    pivot3.position.y = (this.height/2) - 0.033;
    pivot3.position.x = 0;

    pivot4.position.z = 0;
    pivot4.position.y = (this.height/2) - 0.033;
    pivot4.position.x = 0;
    //pivot1.speed = .015;
    this.spin = 0.001;
    //console.log(pivot1.speed);
    //beamPivot1.speed = .01;

    pivot1.setAnimation(

    function (dt){

    //ride.position.set(0, 0, 0);
      //saucer1.rotation.y += saucer1.spin;
        if (this.t == undefined) {
          this.t = 0;
        }

        this.t = this.t + dt;

        if (this.rotation.x >= 0.5){
          down = true;
        }

        if (beamPivot1.rotation.z >= 0.5){
          beamDown = true;
        }

        if (this.rotation.x <= -0.5){
          down = false;
        }

        if (beamPivot1.rotation.z <= -0.5){
          beamDown = false;
        }

        if (!down){

          //counter++;
          this.rotation.x += this.speed;
          //saucer1.rotation.z -= this.speed;
          //console.log(this.speed);
          //pivot1.t = pivot1.t + dt;
        }

        if (!beamDown){
          beamPivot1.rotation.z += beamPivot1.speed;

        }

        if (down){
          //counter--;
          this.rotation.x -= this.speed;
          //saucer1.rotation.z += this.speed;
          //pivot1.t = pivot1.t - dt;
        }

        if(beamDown){
          beamPivot1.rotation.z -= beamPivot1.speed;
        }
    //ride.position.set(0, 0, 0);

    });

    pivot2.setAnimation(

    function(dt){

        if (this.t == undefined) {
          this.t = 0;
        }

        this.t = this.t + dt;

        if (this.rotation.z >= 0.5){
          down = true;
        }

        if (beamPivot2.rotation.z >= 0.5){
          beamDown = true;
        }

        if (this.rotation.z <= -0.5){
          down = false;
        }

        if (beamPivot2.rotation.z <= -0.5){
          beamDown = false;
        }

        if (!down){
          this.rotation.z += this.speed;
          //saucer2.rotation.z -= this.speed;
        }

        if (down){
          this.rotation.z -= this.speed;
          //saucer2.rotation.z += this.speed;
        }

        if (!beamDown){
          beamPivot2.rotation.z += beamPivot2.speed;
        }

        if (beamDown){
          beamPivot2.rotation.z -= beamPivot2.speed;
        }

    });

    pivot3.setAnimation(// Global variables for high-level program state.

    function (dt){

        if (this.t == undefined) {
          this.t = 0;
        }

        this.t = this.t + dt;


        if (this.rotation.z >= 0.5){
          down = true;
        }

        if (beamPivot3.rotation.z >= 0.5){
          beamDown = true;
        }

        if (this.rotation.z <= -0.5){
          down = false;
        }

        if (beamPivot3.rotation.z <= -0.5){
          down = true;
        }

        if (!down){
          this.rotation.z += this.speed;
          //saucer3.rotation.z -= this.speed;
        }

        if (down){
          this.rotation.z -= this.speed;
          //saucer3.rotation.z += this.speed;
        }

        if (!beamDown){
          beamPivot3.rotation.z += beamPivot3.speed;
        }

        if (beamDown){
          beamPivot3.rotation.z -= beamPivot3.speed;
        }


    });

    pivot4.setAnimation(// Global variables for high-level program state.

    function (dt){

        //saucer4.rotation.y += 0.01;

        if (this.t == undefined) {
          this.t = 0;
        }

        this.t = this.t + dt;

        if (this.rotation.x >= 0.5){
          down = true;
        }

        if (beamPivot4.rotation.z >= 0.5){
          beamDown = true;
        }

        if (this.rotation.x <= -0.5){
          down = false;
        }

        if (beamPivot4.rotation.z <= -0.5){
          down = true;
        }

        if (!down){
          this.rotation.x += this.speed;
          //saucer4.rotation.z -= this.speed;

        }

        if (down){
          this.rotation.x -= this.speed;
          //saucer4.rotation.z += this.speed;
        }

        if (!beamDown){
          beamPivot4.rotation.z += beamPivot4.speed;
        }

        if (beamDown){
          beamPivot4.rotation.z -= beamPivot4.speed;
        }

    });

  // Set animation function to repeatedly move from x=-5 to 5.
  base.setAnimation(
    function (dt){
        if (this.t == undefined) {
      this.t = 0;
        }
        this.t = this.t + dt;
        //this.position.x += dt * this.speed;
        //this.position.x = ((this.position.x + 5) % 10) - 5;
        this.rotation.y = this.rotation.y + this.spin;
    });

    //animatedObjects.push(ride);
    //animatedObjects.push(saucer1);
    //animatedObjects.push(pivot1);
    //animatedObjects.push(pivot2);
    //animatedObjects.push(pivot3);
    //animatedObjects.push(pivot4);

    // Make a GUI sign.
    var buttons = [new GUIVR.GuiVRButton("Vert Speed", 1, 0, 5, true,
        function(x){pivot1.speed = x/500; pivot2.speed = x/500; pivot3.speed = x/500; pivot4.speed = x/500;}), new GUIVR.GuiVRButton("Rot Speed", 1, 0, 10, true,
        function(x){base.spin = x/125;}), new GUIVR.GuiVRButton("Light Spd", 0, 0, 3, true, function(x){beamPivot1.speed = x/500;
           beamPivot2.speed = x/500; beamPivot3.speed = x/500; beamPivot4.speed = x/500;})];
    var sign = new GUIVR.GuiVRMenu(buttons);
    sign.position.x = 0;
    sign.position.z = 3;
    sign.position.y = 2;
    this.add(sign);
    //user.add(sign);
    // Pose the exhibit.
    base.rotation.y = THREE.Math.degToRad(90);
    //base.position.z = -5;

    //base.position.x = 0;

    //scene.add(ride);
  }
}

export class Saucer extends USER.UserPlatform {

  constructor(userRig){
	super();

  this.children.pop();
  this.children.pop();
	// Make the shape of a platform.
	var platform = new THREE.Mesh(
	    new THREE.TorusGeometry(1, 0.4, 8, 6),
	    new THREE.MeshPhongMaterial({color: 'silver'}));

  var halfSphere = new THREE.SphereGeometry(1, 32, 32);
  var material = new THREE.MeshPhongMaterial({color: 'white', opacity:0.5, transparent:true, side:THREE.DoubleSide});
  var dome = new THREE.Mesh(halfSphere, material);
  this.add(dome);
  dome.position.set(0, 0, 0);

	var bead1 = new THREE.Mesh(
	    new THREE.CylinderGeometry(0.1, 0.1, 0.1, 32),
	    new THREE.MeshPhongMaterial({color: 0x00FF00})
    );

  var bead2 = new THREE.Mesh(
  	    new THREE.CylinderGeometry(0.1, 0.1, 0.1, 32),
  	    new THREE.MeshPhongMaterial({color: 0x00FF00})
      );

  var bead3 = new THREE.Mesh(
    	  new THREE.CylinderGeometry(0.1, 0.1, 0.1, 32),
    	  new THREE.MeshPhongMaterial({color: 0x00FF00})
      );

  this.add(bead1);
  this.add(bead2);
  this.add(bead3);
  //this.add(front4);

  platform.rotateX(THREE.Math.degToRad(90));
  //platform.rotateZ(THREE.Math.degToRad(180));
	// The front direction of the platform is -z.
	bead1.position.y = 0.1;
	bead1.position.z = -1.15;
  bead2.position.y = 0.1;
  bead2.position.z = 1.2;
  bead3.position.y = 0.1;
  bead3.position.x = 1.30;

	this.add(platform);

	this.collider = platform;

	this.userRig = userRig;

  }

  collide(uv, pt){
	// When the user clicks on this platform, move the user to it.
	   this.add(this.userRig);
  }

}
