import {
  AmbientLight,
  Color,
  DirectionalLight,
  GridHelper,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneBufferGeometry,
  Raycaster,
  Scene,
  TextureLoader,
  Vector2, Vector3,
  WebGLRenderer,
} from 'three'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

//https://stackoverflow.com/questions/923885/capture-html-canvas-as-gif-jpg-png-pdf
//https://stackoverflow.com/questions/158750/can-you-combine-multiple-images-into-a-single-one-using-javascript

//https://stackoverflow.com/questions/19351419/exporting-threejs-scene-to-obj-format

var camera, scene, renderer, controls
var plane, mouse, raycaster
var mtlLoader = new MTLLoader()
var objLoader = new OBJLoader()
var textureLoader = new TextureLoader()
var sachet, frontSachet, backSachet

init()
render()

function init() {
  camera = new PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000,
  )

  scene = new Scene()
  scene.background = new Color(0xf0f0f0)

  mtlLoader.load('objects/sachet_lowpoly.mtl', function(materials) {
    objLoader.setMaterials(materials)
    objLoader.load('objects/sachet_lowpoly.obj', (object) => {

      sachet = object
      sachet.position.y = 2

      sachet.traverse((child) => {
        if (child instanceof Mesh) {
          frontSachet = child.material[0];
          backSachet = child.material[1];
        }
      });

      scene.add(object)
    })
  })


  // grid
  const gridHelper = new GridHelper(100, 20)
  scene.add(gridHelper)

  raycaster = new Raycaster()
  mouse = new Vector2()
  const geometry = new PlaneBufferGeometry(100, 100)

  plane = new Mesh(geometry, new MeshBasicMaterial({ visible: false }))
  scene.add(plane)

  // lights
  const ambientLight = new AmbientLight(0xffffff, 1)
  scene.add(ambientLight)

  var directionalLight = new DirectionalLight(0xffffff, 0.2)
  directionalLight.position.set(100, 100, 0.5).normalize()
  scene.add(directionalLight)
  //
  // var directionalLight2 = new DirectionalLight(0xffffff)
  // directionalLight2.position.set(-100, 0.75, 0.5).normalize()
  // scene.add(directionalLight2)
  //
  var directionalLight3 = new DirectionalLight(0xffffff, 0.2)
  directionalLight3.position.set(-100, 100, 1).normalize()
  scene.add(directionalLight3)
  //
  // var directionalLight4 = new DirectionalLight(0xffffff)
  // directionalLight4.position.set(100, 0.75, -0.5).normalize()
  // scene.add(directionalLight4)

  renderer = new WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)

  document.getElementById('main').appendChild(renderer.domElement)

  renderer.render(scene, camera)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.object.position.set(25, 7, 0)
  controls.target = new Vector3(0, 7, 0)
  controls.minDistance = 10
  controls.maxDistance = 100

  // controls.update();

  function animate() {
    requestAnimationFrame(animate)
    controls.update()

    if (sachet) sachet.rotation.y = Date.now() * 0.0003

    renderer.render(scene, camera)
  }

  animate()
}

function loadTexture(uri, front = true) {
  return new Promise((resolve, reject) => {
    textureLoader.load(uri, (texture) => {
      if (front) {
        frontSachet.map = texture
      } else {
        backSachet.map = texture
      }

      resolve()
    }, null, (error) => {
      reject(error)
    })
  })
}

function render() {
  renderer.render(scene, camera)
}

/* RE DRAWING */
const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')
const canvasFront = document.getElementById('canvas-front')
const contextFront = canvasFront.getContext('2d')

const parameters = {
  'logo-file': null,
  'sides-opacity': 100,
  'face': 'C',
  'face-color': '#ffffff',
  'face-file': null,
  'face-opacity': 100,
  'back': 'C',
  'back-color': '#ffffff',
  'back-file': null,
  'back-opacity': 100,
}

function loadImage(imagePath) {
  return new Promise((resolve, reject) => {
    let image = new Image()
    image.onload = () => {
      resolve(image)
    }
    image.onerror = (err) => {
      reject(err)
    }
    image.src = imagePath
  })
}

function loadFile(file) {
  return new Promise((resolve, reject) => {
    let fr = new FileReader()
    fr.onload = () => {
      resolve(fr)
    }
    fr.onerror = (err) => {
      reject(err)
    }
    fr.readAsDataURL(file)
  })
}

$(document).on('change', 'input', (e) => {
  if (e.target.files && e.target.files.length) {
    // parameters[e.target.name] = e.target.files[0];
    $(e.target).next('label').html(e.target.files[0].name)

    loadFile(e.target.files[0]).then((fr) => {
      parameters[e.target.name] = fr.result
      updateCanvasFront()
    })

  } else {
    parameters[e.target.name] = e.target.value
    updateCanvasFront()
  }
})

const updateCanvas = () => {
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.globalCompositeOperation = 'destination-in'

  const imageSources = ['objects/dos/stridePicDos.png', 'objects/dos/DessinDos.png', 'objects/dos/TextDos.png']

  Promise.all(imageSources.map(i => loadImage(i)))
    .then((images) => {
      images.forEach((image, index) => {
        // console.log(image);
        if (!index) {
          canvas.width = image.width
          canvas.height = image.height

          if (parameters['back'] === 'C') {
            context.fillStyle = parameters['back-color']
            context.fillRect(0, 0, image.width, image.height)
          }

          context.globalAlpha = parameters['sides-opacity'] / 100
          context.drawImage(image, 0, 0, image.width, image.height)
          context.globalAlpha = 1

        } else {
          context.drawImage(image, 0, 0, image.width, image.height)
        }
      })
    }).then(() => {
    return loadTexture(canvas.toDataURL(), false)
  }).catch((err) => {
    console.error(err)
  });
}

const LOGO_CENTER_X = 2217, LOGO_CENTER_Y = 3000, LOGO_MAX_WIDTH = 3000, LOGO_MAX_HEIGHT = 4000

const updateCanvasFront = () => {
  contextFront.clearRect(0, 0, canvas.width, canvas.height)
  contextFront.globalCompositeOperation = 'destination-in'

  const logoImage = parameters['logo-file'] || 'objects/logoExample.png';
  const imageSources = ['objects/face/stridePicFace.png', 'objects/face/DessinFace.png', 'objects/face/TextFace.png', logoImage];

  const backgroundImage = parameters['face'] === 'I' && parameters['face-file'] ? parameters['face-file'] : null;

  // console.log(backgroundImage);
  // if (backgroundImage) {
  //   imageSources.unshift(backgroundImage);
  // }

  Promise.all(imageSources.map(i => loadImage(i)))
    .then((images) => {
      images.forEach((image, index) => {
        const actualIndex = backgroundImage ? index - 1 : index;

        if (!index) {
          canvasFront.width = image.width
          canvasFront.height = image.height

          if (parameters['face'] === 'C') {
            contextFront.fillStyle = parameters['face-color']
            contextFront.fillRect(0, 0, image.width, image.height)
          }

          contextFront.globalAlpha = parameters['sides-opacity'] / 100
          contextFront.drawImage(image, 0, 0, image.width, image.height)
          contextFront.globalAlpha = 1

        } else if (index === images.length - 1) {
          const wider = image.width > image.height
          let width, height
          if (wider) {
            width = LOGO_MAX_WIDTH
            height = (LOGO_MAX_WIDTH / image.width) * image.height
          } else {
            width = (LOGO_MAX_HEIGHT / image.height) * image.width
            height = LOGO_MAX_HEIGHT
          }

          const dx = LOGO_CENTER_X - (width / 2)
          const dy = LOGO_CENTER_Y - (height / 2)

          contextFront.drawImage(image, dx, dy, width, height)
        } else {
          contextFront.drawImage(image, 0, 0, image.width, image.height)
        }
      })
    }).then(() => {
    return loadTexture(canvasFront.toDataURL(), true);
  }).then(updateCanvas).catch((err) => {
    console.error(err)
  });
}

updateCanvasFront();

document.getElementById('download-front').addEventListener('click', function() {
  this.href = canvasFront.toDataURL();
  this.download = 'front.png';
}, false);
document.getElementById('download-back').addEventListener('click', function() {
  this.href = canvas.toDataURL();
  this.download = 'back.png';
}, false);