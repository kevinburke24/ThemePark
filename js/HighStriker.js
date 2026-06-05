import * as THREE from '../extern/build/three.module.js';
import * as GUIVR from './GuiVR.js';
import * as USER from './User.js';

const TOWER_HEIGHT = 8;
const TOWER_Z = -4;

// A momentary click button for use with the GuiVR raycasting system.
class ActionButton extends GUIVR.GuiVR {
    constructor(label, onClick) {
        super();
        var ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width = 256;
        ctx.canvas.height = 64;
        ctx.fillStyle = '#aa1111';
        ctx.fillRect(0, 0, 256, 64);
        ctx.strokeStyle = '#ffdddd';
        ctx.lineWidth = 3;
        ctx.strokeRect(4, 4, 248, 56);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 128, 32);
        var texture = new THREE.CanvasTexture(ctx.canvas);
        var mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(1.0, 0.25),
            new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide})
        );
        this.add(mesh);
        this.collider = mesh;
        this._onClick = onClick;
    }
    collide() { this._onClick(); }
}

export class HighStriker extends THREE.Group {
    constructor(user) {
        super();

        // Stand platform
        var platform = new USER.UserPlatform(user);
        this.add(platform);

        // ---- Tower body ----
        var towerBody = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, TOWER_HEIGHT, 0.4),
            new THREE.MeshPhongMaterial({color: 0x8B4513})
        );
        towerBody.position.set(0, TOWER_HEIGHT / 2, TOWER_Z);
        this.add(towerBody);

        // Striking base pad at the bottom
        var basePad = new THREE.Mesh(
            new THREE.CylinderGeometry(0.55, 0.55, 0.15, 24),
            new THREE.MeshPhongMaterial({color: 0x5C3317})
        );
        basePad.position.set(0, 0.075, TOWER_Z);
        this.add(basePad);

        // ---- Score markers (canvas texture on a board beside the tower) ----
        var mW = 256, mH = 1024;
        var markerCanvas = document.createElement('canvas');
        markerCanvas.width = mW;
        markerCanvas.height = mH;
        var mctx = markerCanvas.getContext('2d');

        mctx.fillStyle = '#1a1a2e';
        mctx.fillRect(0, 0, mW, mH);

        // Vertical gradient color bar on the left
        var grad = mctx.createLinearGradient(0, mH, 0, 0);
        grad.addColorStop(0,   '#00cc00');
        grad.addColorStop(0.4, '#ffff00');
        grad.addColorStop(0.7, '#ff8800');
        grad.addColorStop(1,   '#ff0000');
        mctx.fillStyle = grad;
        mctx.fillRect(8, 0, 18, mH);

        // Tick marks and numbers for 0–1000
        for (var i = 0; i <= 10; i++) {
            var score = i * 100;
            var cy = mH - (i / 10) * mH;
            var major = (i % 5 === 0);
            mctx.strokeStyle = '#ffffff';
            mctx.lineWidth = major ? 3 : 1.5;
            mctx.beginPath();
            mctx.moveTo(26, cy);
            mctx.lineTo(major ? 90 : 60, cy);
            mctx.stroke();
            if (major || i % 2 === 0) {
                mctx.fillStyle = major ? '#ffffff' : '#aaaaaa';
                mctx.font = 'bold ' + (major ? '24' : '18') + 'px Arial';
                mctx.textAlign = 'left';
                mctx.textBaseline = 'middle';
                mctx.fillText(score.toString(), 95, cy);
            }
        }

        var markerTexture = new THREE.CanvasTexture(markerCanvas);
        var markerBoard = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(0.85, TOWER_HEIGHT),
            new THREE.MeshBasicMaterial({map: markerTexture, side: THREE.DoubleSide})
        );
        markerBoard.position.set(0.63, TOWER_HEIGHT / 2, TOWER_Z);
        this.add(markerBoard);

        // ---- Bell at the top ----
        var bellMat = new THREE.MeshPhongMaterial({
            color: 0xFFD700,
            shininess: 120,
            emissive: new THREE.Color(0x443300)
        });

        var bellDome = new THREE.Mesh(
            new THREE.SphereGeometry(0.42, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
            bellMat
        );
        bellDome.rotation.x = Math.PI; // opening faces down
        bellDome.position.set(0, TOWER_HEIGHT + 0.18, TOWER_Z);
        this.add(bellDome);

        var bellRim = new THREE.Mesh(
            new THREE.TorusGeometry(0.42, 0.055, 8, 24),
            bellMat
        );
        bellRim.position.set(0, TOWER_HEIGHT + 0.18, TOWER_Z);
        this.add(bellRim);

        var bellFinial = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshPhongMaterial({color: 0xFFD700, emissive: new THREE.Color(0x664400)})
        );
        bellFinial.position.set(0, TOWER_HEIGHT + 0.65, TOWER_Z);
        this.add(bellFinial);

        // ---- Margin lights along both sides of the tower ----
        var NUM_LIGHTS = 16;
        var LIGHT_COLORS = [0xff2020, 0xff8800, 0xffff00, 0x00ff44, 0x00aaff, 0xaa00ff];
        var lightMeshes = []; // {mesh, height, baseColor}

        for (var side = -1; side <= 1; side += 2) {
            for (var j = 0; j < NUM_LIGHTS; j++) {
                var lh = (j / (NUM_LIGHTS - 1)) * TOWER_HEIGHT;
                var colorHex = LIGHT_COLORS[j % LIGHT_COLORS.length];
                var lMesh = new THREE.Mesh(
                    new THREE.SphereGeometry(0.09, 8, 6),
                    new THREE.MeshBasicMaterial({color: colorHex})
                );
                lMesh.position.set(side * 0.35, lh, TOWER_Z);
                this.add(lMesh);
                lightMeshes.push({mesh: lMesh, height: lh, baseColor: colorHex});
            }
        }

        // ---- Silver puck ----
        var puck = new THREE.Mesh(
            new THREE.CylinderGeometry(0.32, 0.32, 0.14, 32),
            new THREE.MeshPhongMaterial({color: 0xC0C0C0, shininess: 200, specular: 0xffffff})
        );
        puck.position.set(0, 0.1, TOWER_Z);
        this.add(puck);

        // ---- Hammer ----
        // Pivot sits to the right of the tower base. The arm extends along
        // local +X. rotation.z = π/2 → arm points up (rest);
        // rotation.z = π   → arm points left to strike the base (strike).
        var hammerPivot = new THREE.Group();
        hammerPivot.position.set(2.5, 0.5, TOWER_Z);

        var hammerHandle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055, 0.055, 2.4, 12),
            new THREE.MeshPhongMaterial({color: 0x8B4513})
        );
        hammerHandle.rotation.z = Math.PI / 2; // lay along local X
        hammerHandle.position.set(1.2, 0, 0);  // span 0→2.4 in local X
        hammerPivot.add(hammerHandle);

        var hammerHead = new THREE.Mesh(
            new THREE.CylinderGeometry(0.22, 0.22, 0.55, 16),
            new THREE.MeshPhongMaterial({color: 0x707070, shininess: 80})
        );
        hammerHead.rotation.z = Math.PI / 2;
        hammerHead.position.set(2.55, 0, 0);
        hammerPivot.add(hammerHead);

        hammerPivot.rotation.z = Math.PI / 2; // start pointing up
        this.add(hammerPivot);

        // ---- Score board ----
        var sbW = 256, sbH = 192;
        var sbCanvas = document.createElement('canvas');
        sbCanvas.width = sbW;
        sbCanvas.height = sbH;
        var sbCtx = sbCanvas.getContext('2d');
        var sbTexture = new THREE.CanvasTexture(sbCanvas);

        var sbMesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(2.2, 1.65),
            new THREE.MeshBasicMaterial({map: sbTexture, side: THREE.DoubleSide})
        );
        sbMesh.position.set(-1.8, 3.2, TOWER_Z);
        this.add(sbMesh);

        var bestScore = 0;

        function updateScoreBoard(score, msg) {
            sbCtx.fillStyle = '#000033';
            sbCtx.fillRect(0, 0, sbW, sbH);
            sbCtx.strokeStyle = '#4488ff';
            sbCtx.lineWidth = 3;
            sbCtx.strokeRect(3, 3, sbW - 6, sbH - 6);
            sbCtx.textAlign = 'center';
            sbCtx.textBaseline = 'top';
            sbCtx.fillStyle = '#ffdd00';
            sbCtx.font = 'bold 22px Arial';
            sbCtx.fillText('HIGH STRIKER', sbW / 2, 10);
            sbCtx.fillStyle = '#ffffff';
            sbCtx.font = 'bold 52px Arial';
            sbCtx.fillText(score.toString(), sbW / 2, 42);
            sbCtx.fillStyle = '#aaaaff';
            sbCtx.font = '18px Arial';
            sbCtx.fillText('Best: ' + bestScore, sbW / 2, 108);
            if (msg) {
                sbCtx.fillStyle = '#ff6666';
                sbCtx.font = 'bold 22px Arial';
                sbCtx.fillText(msg, sbW / 2, 142);
            }
            sbTexture.needsUpdate = true;
        }
        updateScoreBoard(0, 'Click SWING!');

        // ---- Controls ----
        var powerLevel = 60;
        var powerBtn = new GUIVR.GuiVRButton('Power', 60, 10, 100, true, function(x) {
            powerLevel = x;
        });
        var menu = new GUIVR.GuiVRMenu([powerBtn]);
        menu.position.set(-1.5, 1.3, TOWER_Z + 2);
        this.add(menu);

        // Animation state - declared before ActionButton closure that references them
        var swingPhase = 'rest'; // 'rest' | 'striking' | 'returning'
        var puckVel = 0;
        var puckY = 0.1;
        var maxPuckY = 0.1;
        var currentScore = 0;
        var swingAngle = Math.PI / 2;
        var bellFlash = 0;
        var animT = 0;

        var swingBtn = new ActionButton('SWING!', function() {
            if (swingPhase === 'rest') {
                swingPhase = 'striking';
                maxPuckY = 0.1;
                currentScore = 0;
            }
        });
        swingBtn.position.set(0.5, 1.3, TOWER_Z + 2);
        this.add(swingBtn);

        // ---- Main animation ----
        var GRAVITY     = 0.016;
        var SWING_SPEED = 3.0;
        var REST_ANGLE  = Math.PI / 2;
        var STRIKE_ANGLE = Math.PI;

        this.setAnimation(function(dt) {
            animT += dt;

            // Hammer swing
            if (swingPhase === 'striking') {
                swingAngle += SWING_SPEED * dt;
                if (swingAngle >= STRIKE_ANGLE) {
                    swingAngle = STRIKE_ANGLE;
                    puckVel = powerLevel * 0.005; // max power 100 → v0=0.5, reaches ~7.8 units
                    swingPhase = 'returning';
                }
                hammerPivot.rotation.z = swingAngle;
            } else if (swingPhase === 'returning') {
                swingAngle -= SWING_SPEED * 0.45 * dt;
                if (swingAngle <= REST_ANGLE) {
                    swingAngle = REST_ANGLE;
                    swingPhase = 'rest';
                }
                hammerPivot.rotation.z = swingAngle;
            }

            // Puck physics
            if (puckVel !== 0 || puckY > 0.1) {
                puckVel -= GRAVITY;
                puckY += puckVel;

                if (puckY > maxPuckY) maxPuckY = puckY;

                // Hit the bell
                if (puckY >= TOWER_HEIGHT - 0.15) {
                    puckY = TOWER_HEIGHT - 0.15;
                    puckVel = 0;
                    currentScore = 1000;
                    if (1000 > bestScore) bestScore = 1000;
                    bellFlash = 3.0;
                    updateScoreBoard(1000, 'DING! DING!');
                }

                // Hit the ground
                if (puckY <= 0.1) {
                    puckY = 0.1;
                    if (puckVel < 0) {
                        puckVel = 0;
                        if (currentScore !== 1000) {
                            currentScore = Math.min(999, Math.round(
                                (maxPuckY / (TOWER_HEIGHT - 0.15)) * 1000
                            ));
                            if (currentScore > bestScore) bestScore = currentScore;
                            var msg = currentScore >= 900 ? 'SO CLOSE!' : '';
                            updateScoreBoard(currentScore, msg);
                        }
                    }
                }

                puck.position.y = puckY;
            }

            // Bell flash animation
            if (bellFlash > 0) {
                bellFlash -= dt;
                var flashOn = Math.floor(bellFlash * 8) % 2 === 0;
                bellMat.color.setHex(flashOn ? 0xFFFFFF : 0xFFD700);
                bellMat.emissive.setHex(flashOn ? 0x888800 : 0x443300);
                if (bellFlash <= 0) {
                    bellMat.color.setHex(0xFFD700);
                    bellMat.emissive.setHex(0x443300);
                }
            }

            // Margin lights: chasing pulse, plus white fill up to puck height
            for (var k = 0; k < lightMeshes.length; k++) {
                var lm = lightMeshes[k];
                if (lm.height <= puckY) {
                    // Puck has passed this light — show white
                    lm.mesh.material.color.setHex(0xffffff);
                } else {
                    // Idle chasing animation
                    var phase = (animT * 2.5 + k * 0.35) % (2 * Math.PI);
                    var bright = (Math.sin(phase) + 1) / 2 * 0.85 + 0.15;
                    var r = ((lm.baseColor >> 16) & 0xff) * bright;
                    var g = ((lm.baseColor >> 8)  & 0xff) * bright;
                    var b =  (lm.baseColor & 0xff) * bright;
                    lm.mesh.material.color.setRGB(r / 255, g / 255, b / 255);
                }
            }
        });
    }
}
