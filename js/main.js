//импорт библиотеки three.js
import * as THREE from "./lib/three.module.js";
//импорт библиотек для загрузки моделей и материалов
import { MTLLoader } from "./lib/MTLLoader.js";
import { OBJLoader } from "./lib/OBJLoader.js";

import { GLTFLoader } from "./lib/GLTFLoader.js";

// Ссылка на элемент веб страницы в котором будет отображаться графика
var container;
// Переменные "камера", "сцена" и "отрисовщик"
var camera, scene, renderer;

var clock = new THREE.Clock();

var mixer,
    morphs = [];
mixer = new THREE.AnimationMixer(scene);

// Функция инициализации камеры, отрисовщика, объектов сцены и т.д.
init();
// Обновление данных по таймеру браузера
animate();

// В этой функции можно добавлять объекты и выполнять их первичную настройку
function init() {

    // Получение ссылки на элемент html страницы
    container = document.getElementById("container");
    // Создание "сцены"
    scene = new THREE.Scene();
    // Установка параметров камеры
    // 45 - угол обзора
    // window.innerWidth / window.innerHeight - соотношение сторон
    // 1 - 4000 - ближняя и дальняя плоскости отсечения
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        4000
    );
    // Установка позиции камеры
    camera.position.set(128, 255, 510);
    
    // Установка точки, на которую камера будет смотреть
    camera.lookAt(new THREE.Vector3(128, 0.0, 128));
    // Создание отрисовщика
    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Закрашивание экрана синим цветом, заданным в 16ричной системе
    renderer.setClearColor(0x995599ff, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);
    // Добавление функции обработки события изменения размеров окна
    window.addEventListener("resize", onWindowResize, false);
    
    //создание точечного источника освещения, параметры: цвет, интенсивность, дальность
    //создание точечного источника освещения заданного цвета
    //создание точечного источника освещения, параметры: цвет, интенсивность, дальность
    const light = new THREE.PointLight(0xffffff, 1, 1000);
    light.position.set(300, 200, 128); //позиция источника освещения
    light.castShadow = true; //включение расчёта теней от источника освещения
    scene.add(light); //добавление источника освещения sв сцену
    //настройка расчёта теней от источника освещения
    light.shadow.mapSize.width = 1024; //ширина карты теней в пикселях
    light.shadow.mapSize.height = 1024; //высота карты теней в пикселях
    light.shadow.camera.near = 1; //расстояние, ближе которого не будет теней
    light.shadow.camera.far = 3000; //расстояние, дальше которого не будет теней

    const geometry = new THREE.PlaneGeometry(255, 255, 10, 10);
    const material = new THREE.MeshLambertMaterial({
        color: 0x008800,
        side: THREE.DoubleSide,
        wireframe: false,
    });
    
    const plane = new THREE.Mesh(geometry, material);
    
    plane.position.x = 128;
    plane.position.z = 128;
    plane.rotation.x = Math.PI / 2;
    scene.add(plane);
    plane.receiveShadow = true;
    // plane.castShadow = true;
    
    // вызов функции загрузки модели (в функции Init)
    loadModel("models/", "Tree.obj", "Tree.mtl");
    
    loadAnimatedModel("models/Parrot.glb");
    curveCreator();
}

function onWindowResize() {
    // Изменение соотношения сторон для виртуальной камеры
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    // Изменение соотношения сторон рендера
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// В этой функции можно изменять параметры объектов и обрабатывать действия пользователя
function animate() {
    // воспроизведение анимаций (в функции animate)
    var delta = clock.getDelta();
    mixer.update(delta);
    console.log(mixer);
    for (var i = 0; i < morphs.length; i++) {
        var morph = morphs[i];
    }

    // Добавление функции на вызов, при перерисовки браузером страницы
    requestAnimationFrame(animate);
    render();
}
function render() {
    // Рисование кадра
    renderer.render(scene, camera);
}

function loadModel(path, oname, mname) {
    //где path – путь к папке с моделями
    const onProgress = function (xhr) {
        //выполняющаяся в процессе загрузки
        if (xhr.lengthComputable) {
            const percentComplete = (xhr.loaded / xhr.total) * 100;
            console.log(Math.round(percentComplete, 2) + "% downloaded");
        }
    };
    const onError = function () {}; //выполняется в случае возникновения ошибки
    const manager = new THREE.LoadingManager();
    new MTLLoader(manager)
        .setPath(path) //путь до модели
        .load(mname, function (materials) {
            //название материала
            materials.preload();
            new OBJLoader(manager)
                .setMaterials(materials) //установка материала
                .setPath(path) //путь до модели
                .load(
                    oname,
                    function (object) {
                        object.traverse(function (child) {
                            if (child instanceof THREE.Mesh) {
                                child.castShadow = true;
                            }
                        });

                        for (var i = 0; i < 4; i++) {
                            object.position.x = 1 + Math.random() * 200;
                            object.position.z = 1 + Math.random() * 200;

                            object.scale.set(0.5, 0.5, 0.5);

                            scene.add(object.clone());
                        }
                    },
                    onProgress,
                    onError
                );
        });
}

function loadAnimatedModel(path) {
    //где path – путь и название модели
    var loader = new GLTFLoader();
    loader.load(path, function (gltf) {
        var mesh = gltf.scene.children[0];
        var clip = gltf.animations[0];
        //установка параметров анимации (скорость воспроизведения и стартовый фрейм)

        for (var i = 0; i < 4; i++) {
            mesh.position.set(
                1 + Math.random() * 200,
                20,
                1 + Math.random() * 200
            );
            mesh.rotation.y = Math.PI / 8;
            mesh.scale.set(0.5, 0.5, 0.5);

            mesh.castShadow = true;

            var clone = mesh.clone();

            scene.add(clone);
            morphs.push(clone);
            mixer.clipAction(clip, clone).setDuration(1).startAt(0).play();
        }
    });
}

function curveCreator() {
    var curve1 = new THREE.CubicBezierCurve3(
        new THREE.Vector3(50, 0, 128), //P0
        new THREE.Vector3(50, 0, 0), //P1
        new THREE.Vector3(200, 0, 0), //P2
        new THREE.Vector3(200, 0, 128) //P3
    );
    var vertices = [];
    var curve2 = new THREE.CubicBezierCurve3(
        new THREE.Vector3(50, 0, 128), //P0
        new THREE.Vector3(50, 0, 256), //P1
        new THREE.Vector3(200, 0, 256), //P2
        new THREE.Vector3(200, 0, 128) //P3
    );


    vertices = curve1.getPoints(20);
    vertices = vertices.concat(curve2.getPoints(20));

    // создание кривой по списку точек
    var path = new THREE.CatmullRomCurve3(vertices);
    // является ли кривая замкнутой (зацикленной)
    path.closed = true;

    //создание геометрии из точек кривой
    var geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    var material = new THREE.LineBasicMaterial({ color: 0xaaff00 });

    //создание объекта
    var curveObject = new THREE.Line(geometry, material);
    scene.add(curveObject); //добавление объекта в сцену
}

function moveByPath(){
    //Для нахождения такой точки может быть использован метод кривой getPointAt:
    var pos = new THREE.Vector3();
    pos.copy(path.getPointAt(t / T));
    var nextPoint = new THREE.Vector3();
    nextPoint.copy(path.getPointAt((t + 0.1) / T));
    object.lookAt(nextPoint);
}