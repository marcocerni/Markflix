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
let paramFront, paramBack
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

/* RE DRAWING */
const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')
const canvasFront = document.getElementById('canvas-front')
const contextFront = canvasFront.getContext('2d')

const parameters = {
  'logo-file': null,
  'sides-opacity': 50,
  'face-color': '#ffffff',
  'face-file': null,
  'face-opacity': 100,
  'face-font-color': '#000000',
  'back-color': '#ffffff',
  'back-file': null,
  'back-opacity': 100,
  'back-font-color': '#000000',
  'email': null,
}

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


function loadImage(imagePath) {

  if (typeof imagePath === 'object') {
    return Promise.resolve(imagePath)
  }

  return new Promise((resolve, reject) => {
    let image = new Image()
    image.onload = () => {
      resolve(image)
    }
    image.onerror = (err) => {
      reject(err)
    }
    // if (isURL(imagePath)) {
    //   image.src = `${sachetUrl}/${sachetHash}/logo`
    // } else {
      image.src = imagePath
    // }
  })
}

function filterImage(image, color) {
  const c = document.createElement('canvas')
  const cctx = c.getContext('2d')
  c.width = CANVAS_WIDTH
  c.height = CANVAS_HEIGHT

  cctx.globalCompositeOperation = 'source-over'
  cctx.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  cctx.fillStyle = color //'rgba(217, 87, 83, 1)'
  cctx.fillRect(0, 0, c.width, c.height)

  cctx.globalCompositeOperation = 'destination-in'
  cctx.drawImage(image, 0, 0, c.width, c.height)

  // reset comp. mode to default
  cctx.globalCompositeOperation = 'source-over'

  return loadImage(c.toDataURL())
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
      updateCanvas()
    })

    addCloseButtonToInput(e.target)

  } else {
    parameters[e.target.name] = e.target.value

    if (e.target.value !== e.target.getAttribute('data-default-value') && e.target.type === 'color')
      addCloseButtonToInput(e.target)

    updateCanvasFront()
    updateCanvas()
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

const updateCanvas = async () => {
  const newParamBack = `${parameters['sides-opacity']}/${parameters['back-color']}/${parameters['back-file']}/${parameters['back-opacity']}/${parameters['back-font-color']}`

  if (newParamBack === paramBack) return

  paramBack = newParamBack

  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  context.globalCompositeOperation = 'destination-in'

  cctx.clearRect(CANVAS_WIDTH, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT

  const backgroundColor = parameters['back-color']

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  context.fillStyle = backgroundColor
  context.fillRect(DX, DY, BACKGROUND_WIDTH, BACKGROUND_HEIGHT)

  if (backgroundColor !== '#ffffff') {
    cctx.fillStyle = backgroundColor
    cctx.fillRect(CANVAS_WIDTH + DX_F, DY_F, BACKGROUND_WIDTH_F, BACKGROUND_HEIGHT_F)
  }

  const backgroundImage = parameters['back-file']

  if (backgroundImage) {
    await loadImage(backgroundImage).then((image) => {
      context.globalAlpha = parameters['back-opacity'] / 100
      context.drawImage(image, DX, DY, BACKGROUND_WIDTH, BACKGROUND_HEIGHT)
      context.globalAlpha = 1

      cctx.globalAlpha = parameters['back-opacity'] / 100
      cctx.drawImage(image, CANVAS_WIDTH + DX_F, DY_F, BACKGROUND_WIDTH_F, BACKGROUND_HEIGHT_F)
      cctx.globalAlpha = 1
    })
  }

  const imageSources = [$('#stridePicDos')[0], $('#DessinDos')[0], $('#TextDos')[0]]

  await Promise.all(imageSources.map((image, index) => {
    if (index !== imageSources.length - 1) {
      return loadImage(image)
    } else {
      return loadImage(image).then((image) => {
        return filterImage(image, parameters['back-font-color'])
      })
    }
  }))
    .then((images) => {
      images.forEach((image, index) => {

        if (!index) {
          context.globalAlpha = parameters['sides-opacity'] / 100
          context.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
          context.globalAlpha = 1

        } else {
          context.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        }
      })
    }).then(() => {
      return loadTexture(canvas.toDataURL(), false)
    }).catch((err) => {
      console.error(err)
    })

  const imageSourcesSachet = [$('#DessinDosSachet')[0], $('#TextDosSachet')[0]]

  await Promise.all(imageSourcesSachet.map((image, index) => {
    if (index !== imageSourcesSachet.length - 1) {
      return loadImage(image)
    } else {
      return loadImage(image).then((image) => {
        return filterImage(image, parameters['back-font-color'])
      })
    }
  }))
    .then((images) => {
      images.forEach((image, index) => {
        cctx.drawImage(image, CANVAS_WIDTH, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      })
    }).catch((err) => {
      console.error(err)
    })
}

// const LOGO_CENTER_X = 2217 (665), LOGO_CENTER_Y = 3000, LOGO_MAX_WIDTH = 3000, LOGO_MAX_HEIGHT = 4000

// const LOGO_CENTER_X = 665, LOGO_CENTER_Y = 900, LOGO_MAX_WIDTH = 950, LOGO_MAX_HEIGHT = 1200
// const CANVAS_WIDTH = 1330, CANVAS_HEIGHT = 2177
// const BORDER_WIDTH = 200, BORDER_HEIGHT = 200

const LOGO_CENTER_X = 1330, LOGO_CENTER_Y = 1800, LOGO_MAX_WIDTH = 1900, LOGO_MAX_HEIGHT = 2400
const CANVAS_WIDTH = 2660, CANVAS_HEIGHT = 4354
const BORDER_WIDTH = 400, BORDER_HEIGHT = 400

const DX = BORDER_WIDTH, DY = BORDER_HEIGHT, BACKGROUND_WIDTH = CANVAS_WIDTH - (2 * BORDER_WIDTH),
  BACKGROUND_HEIGHT = CANVAS_HEIGHT - (2 * BORDER_HEIGHT)
const BORDER_WIDTH_F = 320, BORDER_HEIGHT_F = 350
// const BORDER_WIDTH_F = 640, BORDER_HEIGHT_F = 700
const DX_F = BORDER_WIDTH_F, DY_F = BORDER_HEIGHT_F, BACKGROUND_WIDTH_F = CANVAS_WIDTH - (2 * BORDER_WIDTH_F),
  BACKGROUND_HEIGHT_F = CANVAS_HEIGHT - (2 * BORDER_HEIGHT_F)

const cResult = document.createElement('canvas')
const cctx = cResult.getContext('2d')
cctx.globalCompositeOperation = 'source-over'
cResult.width = CANVAS_WIDTH * 2
cResult.height = CANVAS_HEIGHT

const updateCanvasFront = async () => {
  const newParamFront = `${parameters['logo-file']}/${parameters['sides-opacity']}/${parameters['face-color']}/${parameters['face-file']}/${parameters['face-opacity']}/${parameters['face-font-color']}`

  if (newParamFront === paramFront) return

  paramFront = newParamFront
  contextFront.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  contextFront.globalCompositeOperation = 'destination-in'

  cctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  canvasFront.width = CANVAS_WIDTH
  canvasFront.height = CANVAS_HEIGHT

  const backgroundColor = parameters['face-color']

  contextFront.fillStyle = '#ffffff'
  contextFront.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  contextFront.fillStyle = backgroundColor
  contextFront.fillRect(DX, DY, BACKGROUND_WIDTH, BACKGROUND_HEIGHT)

  if (backgroundColor !== '#ffffff') {
    cctx.fillStyle = backgroundColor
    cctx.fillRect(DX_F, DY_F, BACKGROUND_WIDTH_F, BACKGROUND_HEIGHT_F)
  }

  const backgroundImage = parameters['face-file']

  if (backgroundImage) {
    await loadImage(backgroundImage).then((image) => {
      contextFront.globalAlpha = parameters['face-opacity'] / 100
      contextFront.drawImage(image, DX, DY, BACKGROUND_WIDTH, BACKGROUND_HEIGHT)
      contextFront.globalAlpha = 1

      cctx.globalAlpha = parameters['face-opacity'] / 100
      cctx.drawImage(image, DX_F, DY_F, BACKGROUND_WIDTH_F, BACKGROUND_HEIGHT_F)
      cctx.globalAlpha = 1
    })
  }

  let logoImage = parameters['logo-file']

  if (!logoImage && !backgroundImage) {
    logoImage = $('#logoExample')[0] //'objects/logoExample.png'
  }

  const imageSources = [$('#stridePicFace')[0], $('#DessinFace')[0], $('#TextFace')[0]]

  if (logoImage) {
    imageSources.push(logoImage)
  }

  await Promise.all(imageSources.map((image, index) => {
    const textImageIndex = imageSources.length - (logoImage ? 2 : 1)

    if (index !== textImageIndex) {
      return loadImage(image)
    } else {
      return loadImage(image).then((image) => {
        return filterImage(image, parameters['face-font-color'])
      })
    }
  }))
    .then((images) => {
      images.forEach((image, index) => {


        if (!index) {
          contextFront.globalAlpha = parameters['sides-opacity'] / 100
          contextFront.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
          contextFront.globalAlpha = 1

        } else if (index === images.length - 1 && logoImage) {
          const wider = (image.width / LOGO_MAX_WIDTH) > (image.height / LOGO_MAX_HEIGHT)
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

          contextFront.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        }
      })
    }).then(() => {
      return loadTexture(canvasFront.toDataURL(), true)
    }).catch((err) => {
      console.error(err)
    })

  const imageSourcesSachet = [$('#DessinFaceSachet')[0], $('#TextFaceSachet')[0]]

  if (logoImage) {
    imageSourcesSachet.push(logoImage)
  }

  await Promise.all(imageSourcesSachet.map((image, index) => {
    const textImageIndex = imageSourcesSachet.length - (logoImage ? 2 : 1)

    if (index !== textImageIndex) {
      return loadImage(image)
    } else {
      return loadImage(image).then((image) => {
        return filterImage(image, parameters['face-font-color'])
      })
    }
  }))
    .then((images) => {
      images.forEach((image, index) => {

        if (index === images.length - 1 && logoImage) {
          const wider = (image.width / LOGO_MAX_WIDTH) > (image.height / LOGO_MAX_HEIGHT)
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

          cctx.drawImage(image, dx, dy, width, height)
        } else {

          cctx.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        }
      })
    }).catch((err) => {
      console.error(err)
    })
}

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

  await updateCanvasFront()
  await updateCanvas()

  $('.loader').fadeOut()
})

document.getElementById('download-front').addEventListener('click', function() {
  this.href = cResult.toDataURL()
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