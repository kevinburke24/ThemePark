import * as THREE from '../extern/build/three.module.js';
import * as GUIVR from './GuiVR.js';
import * as USER from './User.js';

const TOWER_HEIGHT = 8;
const TOWER_Z = -4;

// A press-and-release button for use with the GuiVR raycasting system.
// onPress fires on mousedown, onRelease fires on mouseup (no drag), onCancel on drag.
class ActionButton extends GUIVR.GuiVR {
    constructor(label, onPress, onRelease, onCancel) {
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
        this._onPress   = onPress;
        this._onRelease = onRelease;
        this._onCancel  = onCancel;
    }
    press()   { if (this._onPress)   this._onPress(); }
    release() { if (this._onRelease) this._onRelease(); }
    cancel()  { if (this._onCancel)  this._onCancel(); }
    collide() {} // handled via press/release
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
        sbMesh.position.set(-1.8, 2.2, TOWER_Z + 2);
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
        updateScoreBoard(0, 'Hold SWING!');

        // ---- Power bar ----
        var pbCanvas = document.createElement('canvas');
        pbCanvas.width = 128;
        pbCanvas.height = 256; // power-of-2 to avoid THREE.js texture resize
        var pbCtx = pbCanvas.getContext('2d');
        var pbTexture = new THREE.CanvasTexture(pbCanvas);
        var pbMesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(0.55, 1.1),
            new THREE.MeshBasicMaterial({map: pbTexture, side: THREE.DoubleSide})
        );
        pbMesh.position.set(-0.8, 1.5, TOWER_Z + 2);
        this.add(pbMesh);

        function updatePowerBar(power) {
            var w = 128, h = 256;
            pbCtx.fillStyle = '#0a0a1a';
            pbCtx.fillRect(0, 0, w, h);

            pbCtx.fillStyle = '#ffdd00';
            pbCtx.font = 'bold 17px Arial';
            pbCtx.textAlign = 'center';
            pbCtx.fillText('POWER', 50, 16);

            var barX = 10, barY = 24, barW = 52, barH = 216;
            pbCtx.fillStyle = '#222';
            pbCtx.fillRect(barX, barY, barW, barH);

            var pct = power / 1000;
            if (pct > 0) {
                var fillH = Math.round(pct * barH);
                var grad = pbCtx.createLinearGradient(0, barY + barH, 0, barY);
                grad.addColorStop(0,   '#00cc00');
                grad.addColorStop(0.5, '#ffff00');
                grad.addColorStop(1,   '#ff2200');
                pbCtx.fillStyle = grad;
                pbCtx.fillRect(barX, barY + barH - fillH, barW, fillH);
            }

            pbCtx.strokeStyle = '#888888';
            pbCtx.lineWidth = 2;
            pbCtx.strokeRect(barX, barY, barW, barH);

            pbCtx.fillStyle = '#ffffff';
            pbCtx.font = 'bold 24px Arial';
            pbCtx.textAlign = 'left';
            pbCtx.fillText(Math.round(power), 70, 140);

            pbTexture.needsUpdate = true;
        }
        updatePowerBar(0);

        // Animation state
        var swingPhase = 'rest'; // 'rest' | 'striking' | 'returning'
        var puckVel = 0;
        var puckY = 0.1;
        var maxPuckY = 0.1;
        var currentScore = 0;
        var swingAngle = Math.PI / 2;
        var bellFlash = 0;
        var animT = 0;

        var isPressing = false;
        var fluctuatingPower = 0;
        var capturedPower = 0;
        var wasSuccessful = false;

        var swingBtn = new ActionButton('SWING!',
            function() { // onPress
                if (swingPhase === 'rest') {
                    isPressing = true;
                    updateScoreBoard(currentScore, 'Release!');
                }
            },
            function() { // onRelease
                if (isPressing && swingPhase === 'rest') {
                    isPressing = false;
                    capturedPower = fluctuatingPower;
                    fluctuatingPower = 0;
                    updatePowerBar(0);
                    swingPhase = 'striking';
                    maxPuckY = 0.1;
                    currentScore = 0;
                    wasSuccessful = false;
                }
            },
            function() { // onCancel (drag while holding)
                isPressing = false;
                fluctuatingPower = 0;
                updatePowerBar(0);
                updateScoreBoard(currentScore, 'Hold SWING!');
            }
        );
        swingBtn.position.set(0.5, 1.3, TOWER_Z + 2);
        this.add(swingBtn);

        // ---- Instruction sign ----
        var instrCanvas = document.createElement('canvas');
        instrCanvas.width = 512;
        instrCanvas.height = 64;
        var instrCtx = instrCanvas.getContext('2d');
        instrCtx.fillStyle = '#222244';
        instrCtx.fillRect(0, 0, 512, 64);
        instrCtx.strokeStyle = '#4488ff';
        instrCtx.lineWidth = 2;
        instrCtx.strokeRect(2, 2, 508, 60);
        instrCtx.fillStyle = '#ffffff';
        instrCtx.font = '17px Arial';
        instrCtx.textAlign = 'center';
        instrCtx.textBaseline = 'middle';
        instrCtx.fillText('Hold down to increase & reduce power,', 256, 22);
        instrCtx.fillText('release to strike!', 256, 44);
        var instrMesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(3.2, 0.4),
            new THREE.MeshBasicMaterial({
                map: new THREE.CanvasTexture(instrCanvas),
                side: THREE.DoubleSide
            })
        );
        instrMesh.position.set(-0.5, 0.65, TOWER_Z + 2);
        this.add(instrMesh);

        // ---- Main animation ----
        var GRAVITY     = 0.016;
        var SWING_SPEED = 3.0;
        var REST_ANGLE  = Math.PI / 2;
        var STRIKE_ANGLE = Math.PI;

        this.setAnimation(function(dt) {
            animT += dt;

            // Power fluctuation while holding SWING
            if (isPressing) {
                // 1.5s per sweep: animT grows at 6/s, so ω = 2π/(1.5×6) = 2π/9
                fluctuatingPower = (Math.sin(animT * 2 * Math.PI / 9) + 1) / 2 * 1000;
                updatePowerBar(fluctuatingPower);
            }

            // Hammer swing
            if (swingPhase === 'striking') {
                swingAngle += SWING_SPEED * dt;
                if (swingAngle >= STRIKE_ANGLE) {
                    swingAngle = STRIKE_ANGLE;
                    puckVel = capturedPower * 0.0005; // 1000 → v0=0.5
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
                    wasSuccessful = true;
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
                            if (currentScore >= 970) {
                                wasSuccessful = true;
                                bellFlash = 3.0;
                                updateScoreBoard(currentScore, 'DING! DING!');
                            } else {
                                var msg = currentScore >= 900 ? 'SO CLOSE!' : 'Hold SWING!';
                                updateScoreBoard(currentScore, msg);
                            }
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

            // Margin lights
            for (var k = 0; k < lightMeshes.length; k++) {
                var lm = lightMeshes[k];
                if (wasSuccessful) {
                    // Success celebration: chasing pulse until next swing
                    var phase = (animT * 2.5 + k * 0.35) % (2 * Math.PI);
                    var bright = (Math.sin(phase) + 1) / 2 * 0.85 + 0.15;
                    var r = ((lm.baseColor >> 16) & 0xff) * bright;
                    var g = ((lm.baseColor >> 8)  & 0xff) * bright;
                    var b =  (lm.baseColor & 0xff) * bright;
                    lm.mesh.material.color.setRGB(r / 255, g / 255, b / 255);
                } else if (puckY > 0.1 && lm.height <= puckY) {
                    // Puck has passed this light — show white
                    lm.mesh.material.color.setHex(0xffffff);
                } else {
                    // Static base color — no pulsing
                    var r = (lm.baseColor >> 16) & 0xff;
                    var g = (lm.baseColor >> 8)  & 0xff;
                    var b =  lm.baseColor & 0xff;
                    lm.mesh.material.color.setRGB(r / 255, g / 255, b / 255);
                }
            }
        });
    }
}
