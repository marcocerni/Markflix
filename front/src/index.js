import {
  AmbientLight, BackSide,
  Color,
  DirectionalLight, DoubleSide, FrontSide,
  GridHelper,
  Mesh,
  MeshBasicMaterial, MeshPhongMaterial,
  PerspectiveCamera,
  PlaneBufferGeometry, PlaneGeometry,
  Raycaster,
  Scene,
  TextureLoader,
  Vector2, Vector3,
  WebGLRenderer,
} from 'three'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import SachetImageGenerator, { loadFile } from './SachetImageGenerator'

//https://stackoverflow.com/questions/923885/capture-html-canvas-as-gif-jpg-png-pdf
//https://stackoverflow.com/questions/158750/can-you-combine-multiple-images-into-a-single-one-using-javascript

//https://stackoverflow.com/questions/19351419/exporting-threejs-scene-to-obj-format

const imagePublicPath = 'public/images'
const sachetUrl = `${backUrl}/sachet`

const mtlLoader = new MTLLoader()
const objLoader = new OBJLoader()
const textureLoader = new TextureLoader()

let camera, scene, renderer, controls
let plane, mouse, raycaster
let sachet, frontSachet, backSachet

function init() {
  return new Promise((resolve, reject) => {
    try {
      camera = new PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        10000,
      )

      scene = new Scene()
      scene.background = new Color(0xf0f0f0)
      // scene.position.set( 10, 0, 0 );

      mtlLoader.load('objects/sachet_lowpoly.mtl', function(materials) {
        objLoader.setMaterials(materials)
        objLoader.load('objects/sachet_lowpoly.obj', (object) => {

          sachet = object
          sachet.position.y = 2

          sachet.traverse((child) => {
            if (child instanceof Mesh) {
              frontSachet = child.material[0]
              // frontSachet.dispose()
              // frontSachet.visible = false;
              backSachet = child.material[1]
              // child.flipSided = true;
              // console.log(backSachet);
              // // console.log(backSachet.geometry);
              // console.log(child);
              // // backSachet.geometry.dynamic = true
              // backSachet.flipSided = true;
              // backSachet.clipIntersection = true;
              // backSachet.side = DoubleSide;

              resolve()
            }
          })

          scene.add(object)
        })
      })

      // grid
      const gridHelper = new GridHelper(100, 20)
      scene.add(gridHelper)

      raycaster = new Raycaster()
      mouse = new Vector2()

      plane = new Mesh(new PlaneBufferGeometry(100, 100), new MeshBasicMaterial({ visible: false }))
      plane.receiveShadow = true
      scene.add(plane)

      // lights
      const ambientLight = new AmbientLight(0xffffff, 1)
      scene.add(ambientLight)

      const directionalLight = new DirectionalLight(0xffffff, 0.2)
      directionalLight.position.set(100, 100, 0.5).normalize()
      scene.add(directionalLight)
      //
      // var directionalLight2 = new DirectionalLight(0xffffff)
      // directionalLight2.position.set(-100, 0.75, 0.5).normalize()
      // scene.add(directionalLight2)
      //
      const directionalLight3 = new DirectionalLight(0xffffff, 0.2)
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

      function animate() {
        requestAnimationFrame(animate)
        controls.update()

        if (sachet) sachet.rotation.y = Date.now() * 0.0003

        renderer.render(scene, camera)
      }

      animate()
      renderer.render(scene, camera)
    } catch (e) {
      reject(e)
    }
  })
}

window.addEventListener('resize', function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)

}, false)

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

const getUrlParameter = function getUrlParameter(sParam) {
  let sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=')

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1])
    }
  }
}

const parameters = SachetImageGenerator.getDefaultParameters()

function loadSachet(id) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${sachetUrl}/${id}`,
      type: 'GET',
      success: function(sachet) {
        sachetId = sachet.id
        sachetHash = sachet.hashedId

        if (sachet.logo && (isDataURL(sachet.logo))) {
          parameters['logo-file'] = sachet.logo
        } else {
          parameters['logo-file'] = sachet.logo ? `${imagePublicPath}/${sachet.logo}` : null
        }

        $('[name="logo-file"]').next('label').html(sachet.logo)
        if (sachet.logo) addCloseButtonToInput($('[name="logo-file"]')[0])
        // $('[name="logo-file"]').prop('required', sachet.logo == null)
        parameters['face-file'] = sachet.frontBackground ? `${imagePublicPath}/${sachet.frontBackground}` : null
        $('[name="face-file"]').next('label').html(sachet.frontBackground)
        if (sachet.frontBackground) addCloseButtonToInput($('[name="face-file"]')[0])
        // $('[name="face-file"]').prop('required', sachet.frontBackground == null)
        parameters['back-file'] = sachet.backBackground ? `${imagePublicPath}/${sachet.backBackground}` : null
        $('[name="back-file"]').next('label').html(sachet.backBackground)
        if (sachet.backBackground) addCloseButtonToInput($('[name="back-file"]')[0])
        // $('[name="back-file"]').prop('required', sachet.backBackground == null)

        parameters['sides-opacity'] = sachet.opacity
        $('[name="sides-opacity"]').val(sachet.opacity)

        parameters['face-color'] = sachet.frontBackgroundColor
        $('[name="face-color"]').val(sachet.frontBackgroundColor)
        if (sachet.frontBackgroundColor && sachet.frontBackgroundColor !== $('[name="face-color"]').data('default-value')) addCloseButtonToInput($('[name="face-color"]')[0])

        parameters['face-opacity'] = sachet.frontBackgroundOpacity
        $('[name="face-opacity"]').val(sachet.frontBackgroundOpacity)
        parameters['face-font-color'] = sachet.frontColor
        $('[name="face-font-color"]').val(sachet.frontColor)
        if (sachet.frontColor && sachet.frontColor !== $('[name="face-font-color"]').data('default-value')) addCloseButtonToInput($('[name="face-font-color"]')[0])


        parameters['back-color'] = sachet.backBackgroundColor
        $('[name="back-color"]').val(sachet.backBackgroundColor)
        if (sachet.backBackgroundColor && sachet.backBackgroundColor !== $('[name="back-color"]').data('default-value')) addCloseButtonToInput($('[name="back-color"]')[0])

        parameters['back-opacity'] = sachet.backBackgroundOpacity
        $('[name="back-opacity"]').val(sachet.backBackgroundOpacity)
        parameters['back-font-color'] = sachet.backColor
        $('[name="back-font-color"]').val(sachet.backColor)
        if (sachet.backColor && sachet.backColor !== $('[name="back-font-color"]').data('default-value')) addCloseButtonToInput($('[name="back-font-color"]')[0])

        parameters['email'] = sachet.email
        $('[name="email"]').val(sachet.email)
        $('[name="email"]').hide()

        $('form [type="submit"]').text('Mettre à jour')
        $('.btn-new-sachet').css('display', 'block')

        showSachetId(sachetId)

        resolve()
      },
      error: function(error) {
        reject(error)
      },
    })
  })
}

function isDataURL(s) {
  return !!s.match(isDataURL.regexData)/* || !!s.match(isDataURL.regexUrl)*/
}

function isURL(s) {
  return !!s.match(isDataURL.regexUrl)
}

isDataURL.regexData = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i
isDataURL.regexUrl = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g

function renderAllImages(parameters) {
  Promise.all([
    sachetGenerator.updateCanvasFront(parameters).then(() => {
      return loadTexture(sachetGenerator.getResultFront(), true)
    }),
    sachetGenerator.updateCanvas(parameters).then(() => {
      return loadTexture(sachetGenerator.getResultBack(), false)
    }),
  ]).then(() => {
    return sachetGenerator.generatePrintImage(parameters)
  })
}

$(document).on('change', 'input', (e) => {
  if (e.target.files && e.target.files.length) {
    // parameters[e.target.name] = e.target.files[0];
    $(e.target).next('label').html(e.target.files[0].name)

    loadFile(e.target.files[0]).then((fr) => {
      parameters[e.target.name] = fr.result

      renderAllImages(parameters)
    })

    addCloseButtonToInput(e.target)

  } else {
    parameters[e.target.name] = e.target.value

    if (e.target.value !== e.target.getAttribute('data-default-value') && e.target.type === 'color')
      addCloseButtonToInput(e.target)

    renderAllImages(parameters)
  }
})

function addCloseButtonToInput(input) {
  $(input).after('<button class="btn btn-warning remove-button" type="button">x</button>')
}

$(document).on('click', '.remove-button', (e) => {
  const $input = $(e.target).siblings('input')

  if ($input.attr('type') === 'file') {
    $(e.target).next('label').html('')

    parameters[$input.attr('name')] = null
    $input.val('')
  } else {
    parameters[$input.attr('name')] = $input.data('default-value')
    $input.val($input.data('default-value'))
  }

  $(e.target).siblings('input').trigger('change')
  $(e.target).remove()
})

const sachetGenerator = new SachetImageGenerator()

let sachetHash = getUrlParameter('id')
let sachetId = null
let editable = getUrlParameter('uxv')

function updateFormResult(animate = false) {
  if (sachetId && !editable) {
    $('.sachet_code').html(sachetId)
    if (animate) {
      $('form').slideUp()
      $('.result-container').slideDown()
    } else {
      $('form').hide()
      $('.result-container').show()
    }
  }
}

function showSachetId(sachetId) {
  $('.sachet-id span').text(sachetId)
  $('.sachet-id').addClass('show')
}

$(window).on('load', async () => {
  await init()

  if (sachetHash) {
    try {
      await loadSachet(sachetHash)
      updateFormResult()
    } catch (e) {
      console.error(e)
      const newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname
      window.location.href = newUrl
    }
  }

  renderAllImages(parameters)

  $('.loader').fadeOut()
})

document.getElementById('download-front').addEventListener('click', function() {
  this.href = sachetGenerator.getResult()
  this.download = (sachetId ? sachetId : 'not-saved-sachet') + '.png'
}, false)

$('form').submit(function(e) {
  e.preventDefault()

  const $button = $(this).find('[type="submit"]')

  const oldContent = $button.html()

  $button.html(oldContent + ' <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>')
  $button.prop('disabled', true)

  $.ajax({
    url: sachetId ? `${sachetUrl}/${sachetId}` : sachetUrl,
    type: sachetId ? 'PATCH' : 'POST',
    data: new FormData($(this)[0]),
    cache: false,
    contentType: false,
    processData: false,
    success: function(sachet) {
      sachetId = sachet.id
      sachetHash = sachet.hashedId
      const newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?id=' + sachetHash
      window.history.pushState({ path: newUrl }, 'GEL + FRANCE - Configurateur 3D', newUrl)

      $button.html(oldContent)
      $button.prop('disabled', false)

      showSachetId(sachetId)

      updateFormResult(true)
    },
    error: function(error) {
      console.error(error)
      $button.html(oldContent)
      $button.prop('disabled', false)
    },
  })

  return false
})

$('.btn-back').click(function() {
  const newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?uxv&id=' + sachetHash
  window.location.href = newUrl
})