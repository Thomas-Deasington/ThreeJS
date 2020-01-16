import * as THREE from './vendor/three.js-master/build/three.module.js'; 
import Stats from './vendor/three.js-master/examples/jsm/libs/stats.module.js';
import { OrbitControls } from './vendor/three.js-master/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from './vendor/three.js-master/examples/jsm/loaders/FBXLoader.js';
//Tout le code va être dans la variable Scene.
const Scene = {
    vars: {
        container: null,
        scene: null,
        renderer: null,
        camera: null,
        controls: null,
        stats: null,
        logoFeelity: null,
        mouse: new THREE.Vector2(),
        raycaster: new THREE.Raycaster(),
        animSpeed: null,
        animPercent: null,
        directional: null,
        directional2: null,
        directional3: null,
        nuit: false,
        compteurNuit: 0,
        chute: false,
        enterre: false,
    },
    init: () => {
        let vars = Scene.vars;
        
        // Preparer le container de la scene
        vars.container = document.createElement('div');
        vars.container.classList.add("fullscreen");
        document.body.appendChild(vars.container); 

        //Création de la scène
        vars.scene = new THREE.Scene();
        vars.scene.background = new THREE.Color(0xa0a0a0);

        //Moteur de rendus
        vars.renderer = new THREE.WebGLRenderer({ antialias: true });
        vars.renderer.setPixelRatio(window.devicePixelRatio);
        vars.renderer.setSize(window.innerWidth, window.innerHeight);
        vars.container.appendChild(vars.renderer.domElement); 

        //Ombres
        vars.renderer.shadowMap.enabled = true;
        vars.renderer.shadowMapSoft = true; 

        //Création de la caméra : 45 pour 45° de vision
        vars.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
        //par défaut caméra à moitier dans le sol, donc on la remonte et on la recule pour mieux voir
        vars.camera.position.set(-1.5, 210, 572);
        
        //Création de la lumière
        let light = new THREE.HemisphereLight(0xFFFFFF, 0x444444, 0.7);
        light.position.set(0, 700, 0); //700 hauteur de la light
        vars.scene.add(light);


         //Lumière directionnelle
         let lightIntensity = 0.6;
         let d = 1000;
         let directional = new THREE.DirectionalLight(0xFF5733, lightIntensity);
         let directional2 = new THREE.DirectionalLight(0x62FF33, lightIntensity);
         let directional3 = new THREE.DirectionalLight(0xFF33E9, lightIntensity);

         vars.directional = directional;
         vars.directional2 = directional2;
         vars.directional3 = directional3;

         directional.castShadow = true;
         directional.shadow.camera.left =-d;
         directional.shadow.camera.right = d;
         directional.shadow.camera.top = d;
         directional.shadow.camera.bottom = -d;
         directional.shadow.camera.far = 2000;
         directional.shadow.mapSize.width = 4096;
         directional.shadow.mapSize.height = 4096;

        
         directional2.castShadow = true;
         directional2.shadow.camera.left =-d;
         directional2.shadow.camera.right = d;
         directional2.shadow.camera.top = d;
         directional2.shadow.camera.bottom = -d;
         directional2.shadow.camera.far = 2000;
         directional2.shadow.mapSize.width = 4096;
         directional2.shadow.mapSize.height = 4096;

         directional3.castShadow = true;
         directional3.shadow.camera.left =-d;
         directional3.shadow.camera.right = d;
         directional3.shadow.camera.top = d;
         directional3.shadow.camera.bottom = -d;
         directional3.shadow.camera.far = 2000;
         directional3.shadow.mapSize.width = 4096;
         directional3.shadow.mapSize.height = 4096;

         directional.position.set(0, 700, 0); 
         directional2.position.set(-400,200,400);
         directional3.position.set(400,200,400);

        //  let helper = new THREE.DirectionalLightHelper(directional3, 5);
         vars.scene.add(directional);
         vars.scene.add(directional2);
         vars.scene.add(directional3);   
        //  vars.scene.add(helper);


        //Création d'un sol
        let sol = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), new THREE.MeshLambertMaterial({ color: new THREE.Color(0x888888) }));
        //Il faut effectuer une rotation (cercle trigonométrique) car le sol est debout face à la caméra
        sol.rotation.x = -Math.PI / 2;
        sol.receiveShadow =false;
        vars.scene.add(sol); 

        let planeMaterial = new THREE.ShadowMaterial();
        planeMaterial.opacity = 0.07;
        let shadowPlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000,
        2000), planeMaterial);
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.receiveShadow = true;
        vars.scene.add(shadowPlane);
        


        //Ajout d'un gridHelper (aide pour le développement)
        // let grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
        // grid.material.opacity = 0.2; //20% d'opacité
        // grid.material.transparent = true;
        // vars.scene.add(grid);

        //Creation de la bulle
        let geometry = new THREE.SphereGeometry(1000,32,32);
        let material = new THREE.MeshPhongMaterial({color: 0xffffff});
        material.side = THREE.DoubleSide;
        let sphere = new THREE.Mesh(geometry, material);
        vars.scene.add(sphere);
        
        // Récupération du texte 
        let hash = document.location.hash.substr( 1 );
        if ( hash.length !== 0 ) {
            var texthash = hash.substring();
            Scene.vars.text = decodeURI( texthash );
        } else {
            Scene.vars.text = "DAWIN";
        }

        vars.texture = new THREE.TextureLoader().load('./img/marbre.jpg');


        //Chargement des objets
        Scene.loadFBX("Socle_Partie1.FBX", 10, [0, 10, 0], [0, 0, 0],0x1A1A1A, "socle1", () => {
            Scene.loadFBX("Socle_Partie2.FBX", 10, [0, 10, 0], [0, 0, 0],0x1A1A1A, "socle2", () => {
                Scene.loadFBX("Statuette.FBX", 10, [0, 0, 0], [600, 600, Math.PI],0xFFD700, "statuette", () => {
                    Scene.loadFBX("Plaquette.FBX", 10, [0, 50, 45], [0, 0, Math.PI],0xFFFFFF, "plaquette", () => {
                        Scene.loadFBX("Logo_Feelity.FBX", 10, [45, 22, 0], [0, Math.PI, Math.PI],0xFFFFFF, "logo1", () => {
                            
                            Scene.loadText(Scene.vars.text, 10, [0,33,46], [0, 0, 0], 0x1A1A1A, "texte",() =>{
                                Scene.loadText("Play", 15, [0,250,-210], [0, 0, 0], 0x1A1A1A, "texte2",() =>{

                            
                            
                                //Positionnement du trophée
                                let trophy = new THREE.Group();
                                trophy.add(Scene.vars.socle1);
                                trophy.add(Scene.vars.socle2);
                                trophy.add(Scene.vars.statuette);
                                trophy.add(Scene.vars.plaquette);
                                trophy.add(Scene.vars.logo1);

                                trophy.add(Scene.vars.texte);

                                trophy.position.z = -50;
                                trophy.position.y = 10;

                                Scene.vars.goldGroup = trophy;


                                let logo2 = Scene.vars.logo1.clone();
                                logo2.position.x = -45;
                                logo2.rotation.y = Math.PI;
                                Scene.vars.logo2 = logo2;
                                trophy.add(logo2);
                                
                                let trophy2 = trophy.clone();
                                trophy2.position.x = -250;
                                trophy2.position.y = 10;
                                trophy2.position.z = 10;
                                trophy2.rotation.y = Math.PI / 4;
                                trophy2.children[2].traverse(node =>{
                                    if(node.isMesh){
                                        let material = new THREE.MeshStandardMaterial({
                                            color: new THREE.Color(0xC0C0C0),
                                            roughness: .3,
                                            metalness: .6
                                        });
                                        node.material = material;
                                    }
                                });
                                Scene.vars.silverGroup = trophy2;


                                let trophy3 = trophy.clone();
                                trophy3.position.x = 250;
                                trophy3.position.y = 10;
                                trophy3.position.z = 10;
                                trophy3.rotation.y = -Math.PI/4;
                                trophy3.children[2].traverse(node =>{
                                    if(node.isMesh){
                                        let material = new THREE.MeshStandardMaterial({
                                            color: new THREE.Color(0xCD7F32),
                                            roughness: .3,
                                            metalness: .6
                                        });
                                        node.material = material;
                                    }
                                });
                                Scene.vars.bronzeGroup = trophy3;

                                vars.scene.add(trophy);
                                vars.scene.add(trophy2);
                                vars.scene.add(trophy3);

                                //Rajout d'un cube
                                let cube = new THREE.Group();

                                var geometry = new THREE.BoxGeometry( 70, 70, 70 );
                                var material = new THREE.MeshBasicMaterial( {color: 0xFF0000} );
                                var meshCube = new THREE.Mesh( geometry, material );
                                meshCube.position.z = -250;
                                meshCube.position.y = 250;


                                cube.add(meshCube);
                                cube.add(Scene.vars.texte2);
                                Scene.vars.cubeGroup = cube;
                                vars.scene.add(cube);

                                
                                document.querySelector("#loading").remove();
                            });
                          });
                        });
                    });
                });
            });

        });
        //Resize de la page
        window.addEventListener('resize', Scene.onWindowResize, false); 

        //Mouvement de la souris
        window.addEventListener('mousemove', Scene.onMouseMove, false);

        //click de la souris sur le cube
        window.addEventListener( 'mousedown', Scene.onMouseDown, false );
        

        //Mise en place des controls et des limites
        vars.controls = new OrbitControls(vars.camera, vars.renderer.domElement);
        vars.controls.target.set(0, 100, 0);
        vars.controls.minPolarAngle = Math.PI / 4;
        vars.controls.maxPolarAngle = Math.PI / 2;
        vars.controls.minAzimuthAngle = -Math.PI / 4;
        vars.controls.maxAzimuthAngle = Math.PI / 4;
        vars.controls.minDistance = 300;
        vars.controls.maxDistance = 600;

        vars.controls.update();
 
        //Mise en place des stats en haut à gauche de l'écran
        // vars.stats = new Stats();
        // vars.container.appendChild(vars.stats.dom);

        Scene.animate(); 
    },
    loadFBX: (file, echelle, position, rotation, couleur, namespace, callback) =>{
        let loader = new FBXLoader();
        
        if(file === undefined){
            return;
        }
        loader.load('./fbx/'+file, (object)=>{
            let data = object;

            data.traverse(node =>{
                if(node.isMesh){
                    node.castShadow = true;
                    node.receiveShadow = true;

                    if(namespace === "plaquette"){
                        node.material = new THREE.MeshBasicMaterial({
                            map: Scene.vars.texture
                        });
                    }
                    if(namespace === "statuette"){
                        node.material = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(couleur),
                            roughness: .3,
                            metalness: .6
                        });
                    }
                    node.material.color = new THREE.Color(couleur);
                    
                }
            });

            data.position.x = position[0];
            data.position.y = position[1];
            data.position.z = position[2];

            data.rotation.x = rotation[0];
            data.rotation.y = rotation[1];
            data.rotation.z = rotation[2];

            data.scale.x = data.scale.y = data.scale.z = echelle;

            Scene.vars[namespace] = data;

            callback();
        });
    },
    loadText: (text, echelle, position, rotation, couleur, namespace, callback) =>{
        let loader = new THREE.FontLoader();

        loader.load('fonts/helvetiker_regular.typeface.json', (font) =>{
            let geometry = new THREE.TextGeometry(text, {
                font: font,
                size: 1,
                height: 0.1,
                curveSegments: 1,
                bevelThickness: 1,
                bevelSize: 1,
                bevelEnabled: false
               });
            //On place l'origine au centre de la TextGeometry
            geometry.computeBoundingBox();
            let offset = geometry.boundingBox.getCenter().negate();
            geometry.translate( offset.x, offset.y, offset.z ); 

            var material = new THREE.MeshBasicMaterial({color : new THREE.Color(couleur)});        
            var mesh = new THREE.Mesh( geometry, material );
           
            mesh.position.x = position[0];
            mesh.position.y = position[1];
            mesh.position.z = position[2];

            mesh.rotation.x = rotation[0];
            mesh.rotation.y = rotation[1];
            mesh.rotation.z = rotation[2];

            mesh.scale.x = mesh.scale.y = mesh.scale.z = echelle;

            Scene.vars[namespace] = mesh;

            callback();
            
        }
            
        );
        
       

    },
    onWindowResize: () =>{
        let vars = Scene.vars;
        vars.camera.aspect = window.innerWidth / window.innerHeight;
        vars.camera.updateProjectionMatrix();
        vars.renderer.setSize(window.innerWidth, window.innerHeight); 
    },
    onMouseMove: (event) =>{
        Scene.vars.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        Scene.vars.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; 
    },
    onMouseDown: (event) =>{
        if (Scene.vars.goldGroup != undefined){

            Scene.vars.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            Scene.vars.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // create an array containing all objects in the scene with which the ray intersects
            let intersects = Scene.vars.raycaster.intersectObjects(Scene.vars.cubeGroup.children, true);
            
            // if there is one (or more) intersections
            if ( intersects.length > 0 )
            {
                var color = new THREE.Color( 0xffffff );
                color.setHex( Math.random() * 0xffffff );
                Scene.vars.cubeGroup.children[0].material.color = new THREE.Color(color);
                if(Scene.vars.directional != undefined){
                    if(Scene.vars.compteurNuit <10){
                        if(Scene.vars.nuit == false){
                            Scene.vars.directional.color.setHex(0x000000);  
                            Scene.vars.directional2.color.setHex(0x000000);  
                            Scene.vars.directional3.color.setHex(0x000000);
                            var son = 'sounds/nuit.mp3';
                            Scene.vars.nuit = true;
                            Scene.vars.compteurNuit ++;
                        }
                        else{
                            Scene.vars.directional.color.setHex(0xFF5733);  
                            Scene.vars.directional2.color.setHex(0x62FF33);  
                            Scene.vars.directional3.color.setHex(0xFF33E9);
                            var son = 'sounds/jour.mp3';
                            Scene.vars.nuit = false;
                            Scene.vars.compteurNuit ++;
                        }
                    }
                    else{
                        Scene.vars.directional.color.setHex(0xFF5733);  
                        Scene.vars.directional2.color.setHex(0x62FF33);  
                        Scene.vars.directional3.color.setHex(0xFF33E9);
                        Scene.vars.compteurNuit ++;
                    }
                }
                

                // create an AudioListener and add it to the camera
                var listener = new THREE.AudioListener();
                Scene.vars.camera.add( listener );

                // create a global audio source
                var sound = new THREE.Audio( listener );

                // load a sound and set it as the Audio object's buffer
                var audioLoader = new THREE.AudioLoader();

                if(Scene.vars.compteurNuit == 11){
                    var son = 'sounds/chut.mp3';
                    Scene.vars.chute = true;
                    audioLoader.load(son, function( buffer ) {
                        sound.setBuffer( buffer );
                        sound.setVolume( 0.5 );
                        sound.play();
                    });
                }
                else if(Scene.vars.compteurNuit == 12){
                    Scene.vars.enterre = true;
                    audioLoader.load('sounds/C-est vraiment pô nice - Mister V [Mpgun (mp3cut.net).mp3', function( buffer ) {
                    sound.setBuffer( buffer );
                    sound.setVolume( 0.5 );
                    sound.play();
                    Scene.vars.compteurNuit++;
                    Scene.vars.cubeGroup.position.y = -600;

                });
                }
                else if(Scene.vars.compteurNuit <12){
                    audioLoader.load(son, function( buffer ) {
                        sound.setBuffer( buffer );
                        sound.setVolume( 0.5 );
                        sound.play();
                    });
                }
            }
        }
    },
    //affiche une image; connecte la camera à la scene
    render: () => {
        Scene.vars.renderer.render(Scene.vars.scene, Scene.vars.camera);
        //Scene.vars.stats.update();
    } ,
    chuteAnimation:() =>{
        if(Scene.vars.chute){
            Scene.vars.bronzeGroup.children[2].rotation.y -= 0.1;
            Scene.vars.silverGroup.children[2].rotation.y -= 0.1;
        }
        if(Scene.vars.enterre){
            Scene.vars.bronzeGroup.children[2].position.y = -100;
            Scene.vars.silverGroup.children[2].position.y = -100;
        }
    },
    customAnimation:() =>{
        if (Scene.vars.goldGroup != undefined){
            Scene.vars.animPercent += Scene.vars.animSpeed;
            if(Scene.vars.animPercent>1){
                Scene.vars.animPercent = 1;
                return;
            }
            if(Scene.vars.animPercent<0){
                Scene.vars.animPercent = 0;
            }

            if(Scene.vars.animPercent <= 0.33){
                Scene.vars.plaquette.position.z = 45 + (25 * 3 * Scene.vars.animPercent);
                Scene.vars.texte.position.z = 46 + (50 * 3 * Scene.vars.animPercent);

            }

            if(Scene.vars.animPercent >= 0.20 && Scene.vars.animPercent <= 0.75){
                //Socle et logo
                let percent = (Scene.vars.animPercent -0.2) / 0.55;
                Scene.vars.socle1.position.x = 25 * percent;
                Scene.vars.socle2.position.x = -25 * percent;
                Scene.vars.logo1.position.x = 45 + 50 *percent;
                Scene.vars.logo2.position.x = -45 - 50 * percent;

            }else if(Scene.vars.animPercent < 0.20){
                //reset socle et logo
                Scene.vars.socle1.position.x = 0;
                Scene.vars.socle2.position.x = 0;
                Scene.vars.logo1.position.x = 45;
                Scene.vars.logo2.position.x = -45;
            }

            if(Scene.vars.animPercent >= 0.40){
                //statuette
                let percentage = (Scene.vars.animPercent - 0.4) / 0.6;
                Scene.vars.statuette.position.y = 50 * percentage;
            }else if(Scene.vars.animPercent < 0.7){
                //reset Statuette
                Scene.vars.statuette.position.y = 0;
            }
        }
    },
    //rafraîchir l'écran régulièrement
    animate: () => {
        requestAnimationFrame(Scene.animate);
        Scene.customAnimation();
        Scene.chuteAnimation();
        Scene.vars.raycaster.setFromCamera(Scene.vars.mouse, Scene.vars.camera);
        if (Scene.vars.goldGroup != undefined){
            let intersects = Scene.vars.raycaster.intersectObjects(Scene.vars.goldGroup.children, true);
            
            //Ajout d'un arrow Helper
            // let arrow = new THREE.ArrowHelper(
            //     Scene.vars.raycaster.ray.direction,
            //     Scene.vars.raycaster.ray.origin,
            //     1000,
            //     0xff0000);
            // Scene.vars.scene.add(arrow);

            if(intersects.length > 0){
                Scene.vars.animSpeed = 0.05;
            }
            else{
                Scene.vars.animSpeed = -0.05;
            }
        }

        Scene.render();
    }

};
Scene.init();
