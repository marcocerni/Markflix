// const LOGO_CENTER_X = 2217 (665), LOGO_CENTER_Y = 3000, LOGO_MAX_WIDTH = 3000, LOGO_MAX_HEIGHT = 4000

const LOGO_CENTER_X = 665, LOGO_CENTER_Y = 900, LOGO_MAX_WIDTH = 950, LOGO_MAX_HEIGHT = 1200
const CANVAS_WIDTH = 1330, CANVAS_HEIGHT = 2177
const BORDER_WIDTH = 200, BORDER_HEIGHT = 200

// const LOGO_CENTER_X = 1330, LOGO_CENTER_Y = 1800, LOGO_MAX_WIDTH = 1900, LOGO_MAX_HEIGHT = 2400
// const CANVAS_WIDTH = 2660, CANVAS_HEIGHT = 4354
// const BORDER_WIDTH = 400, BORDER_HEIGHT = 400

const DX = BORDER_WIDTH, DY = BORDER_HEIGHT, BACKGROUND_WIDTH = CANVAS_WIDTH - (2 * BORDER_WIDTH),
  BACKGROUND_HEIGHT = CANVAS_HEIGHT - (2 * BORDER_HEIGHT)
const BORDER_WIDTH_F = 160, BORDER_HEIGHT_F = 175
// const BORDER_WIDTH_F = 320, BORDER_HEIGHT_F = 350
const DX_F = BORDER_WIDTH_F, DY_F = BORDER_HEIGHT_F, BACKGROUND_WIDTH_F = CANVAS_WIDTH - (2 * BORDER_WIDTH_F),
  BACKGROUND_HEIGHT_F = CANVAS_HEIGHT - (2 * BORDER_HEIGHT_F)


/**
 * Sachet Image Generator:
 *
 * There has to be these images present on the DOM in order to generate finalImage:
 *
 * For front:
 * $('#stridePicFace')
 * $('#DessinFace')
 * $('#TextFace')
 * $('#logoExample')
 *
 * For back:
 * $('#stridePicDos')
 * $('#DessinDos')
 * $('#TextDos')
 *
 * For final sachet image:
 * $('#DessinFaceSachet')
 * $('#TextFaceSachet')
 * $('#DessinDosSachet')
 * $('#TextDosSachet')
 * $('#logoExample')
 */
export default class SachetImageGenerator {
  static getDefaultParameters(logo = null) {
    return {
      'logo-file': logo,
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
  }

  constructor() {
    this.cResult = document.createElement('canvas')
    this.cctx = this.cResult.getContext('2d')

    this.cctx.globalCompositeOperation = 'source-over'
    this.cResult.width = CANVAS_WIDTH * 2
    this.cResult.height = CANVAS_HEIGHT

    this.canvas = document.getElementById('canvas')
    if (!this.canvas) {
      this.canvas = document.createElement('canvas')
      this.canvas.width = CANVAS_WIDTH
      this.canvas.height = CANVAS_HEIGHT
    }
    this.context = this.canvas.getContext('2d')

    this.canvasFront = document.getElementById('canvas-front')
    if (!this.canvasFront) {
      this.canvasFront = document.createElement('canvas')
      this.canvasFront.width = CANVAS_WIDTH
      this.canvasFront.height = CANVAS_HEIGHT
    }
    this.contextFront = this.canvasFront.getContext('2d')
  }

  async updateCanvas(parameters) {
    const newParamBack = `${parameters['sides-opacity']}/${parameters['back-color']}/${parameters['back-file']}/${parameters['back-opacity']}/${parameters['back-font-color']}`

    if (newParamBack === this.paramBack) return

    this.paramBack = newParamBack

    this.context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    this.context.globalCompositeOperation = 'destination-in'

    this.canvas.width = CANVAS_WIDTH
    this.canvas.height = CANVAS_HEIGHT

    const backgroundColor = parameters['back-color']

    this.context.fillStyle = '#ffffff'
    this.context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    this.context.fillStyle = backgroundColor
    this.context.fillRect(DX, DY, BACKGROUND_WIDTH, BACKGROUND_HEIGHT)

    const backgroundImage = parameters['back-file']

    if (backgroundImage) {
      await loadImage(backgroundImage).then((image) => {
        this.context.globalAlpha = parameters['back-opacity'] / 100
        this.context.drawImage(image, DX, DY, BACKGROUND_WIDTH, BACKGROUND_HEIGHT)
        this.context.globalAlpha = 1
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
            this.context.globalAlpha = parameters['sides-opacity'] / 100
            this.context.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
            this.context.globalAlpha = 1

          } else {
            this.context.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
          }
        })
      }).catch((err) => {
        console.error(err)
      })
  }

  async updateCanvasFront(parameters) {
    const newParamFront = `${parameters['logo-file']}/${parameters['sides-opacity']}/${parameters['face-color']}/${parameters['face-file']}/${parameters['face-opacity']}/${parameters['face-font-color']}`

    if (newParamFront === this.paramFront) return

    this.paramFront = newParamFront
    this.contextFront.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    this.contextFront.globalCompositeOperation = 'destination-in'

    this.canvasFront.width = CANVAS_WIDTH
    this.canvasFront.height = CANVAS_HEIGHT

    const backgroundColor = parameters['face-color']

    this.contextFront.fillStyle = '#ffffff'
    this.contextFront.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    this.contextFront.fillStyle = backgroundColor
    this.contextFront.fillRect(DX, DY, BACKGROUND_WIDTH, BACKGROUND_HEIGHT)

    const backgroundImage = parameters['face-file']

    if (backgroundImage) {
      await loadImage(backgroundImage).then((image) => {
        this.contextFront.globalAlpha = parameters['face-opacity'] / 100
        this.contextFront.drawImage(image, DX, DY, BACKGROUND_WIDTH, BACKGROUND_HEIGHT)
        this.contextFront.globalAlpha = 1
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
            this.contextFront.globalAlpha = parameters['sides-opacity'] / 100
            this.contextFront.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
            this.contextFront.globalAlpha = 1

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

            this.contextFront.drawImage(image, dx, dy, width, height)
          } else {

            this.contextFront.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
          }
        })
      }).catch((err) => {
        console.error(err)
      })
  }

  async generatePrintImage(parameters, date = formatDate(), lotNumber = 'C2005284') {

    this.cctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    if (parameters['face-color'] !== '#ffffff') {
      this.cctx.fillStyle = parameters['face-color']
      this.cctx.fillRect(DX_F, DY_F, BACKGROUND_WIDTH_F, BACKGROUND_HEIGHT_F)
    }

    if (parameters['face-file']) {
      await loadImage(parameters['face-file']).then((image) => {
        this.cctx.globalAlpha = parameters['face-opacity'] / 100
        this.cctx.drawImage(image, DX_F, DY_F, BACKGROUND_WIDTH_F, BACKGROUND_HEIGHT_F)
        this.cctx.globalAlpha = 1
      })
    }

    const imageSourcesSachet = [$('#DessinFaceSachet')[0], $('#TextFaceSachet')[0]]

    let logoImage = parameters['logo-file']

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

            this.cctx.drawImage(image, dx, dy, width, height)
          } else {

            this.cctx.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
          }
        })
      }).catch((err) => {
        console.error(err)
      })

    this.cctx.clearRect(CANVAS_WIDTH, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    if (parameters['back-color'] !== '#ffffff') {
      this.cctx.fillStyle = parameters['back-color']
      this.cctx.fillRect(CANVAS_WIDTH + DX_F, DY_F, BACKGROUND_WIDTH_F, BACKGROUND_HEIGHT_F)
    }

    if (parameters['back-file']) {
      await loadImage(parameters['back-file']).then((image) => {
        this.cctx.globalAlpha = parameters['back-opacity'] / 100
        this.cctx.drawImage(image, CANVAS_WIDTH + DX_F, DY_F, BACKGROUND_WIDTH_F, BACKGROUND_HEIGHT_F)
        this.cctx.globalAlpha = 1
      })
    }

    const imageSourcesSachetBack = [$('#DessinDosSachet')[0], $('#TextDosSachet')[0]]

    await Promise.all(imageSourcesSachetBack.map((image, index) => {
      if (index !== imageSourcesSachetBack.length - 1) {
        return loadImage(image)
      } else {
        return loadImage(image).then((image) => {
          return filterImage(image, parameters['back-font-color'])
        })
      }
    }))
      .then((images) => {
        images.forEach((image) => {
          this.cctx.drawImage(image, CANVAS_WIDTH, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        })
      }).catch((err) => {
        console.error(err)
      })

    this.cctx.font = '36px Arial'
    this.cctx.fillText(date, (CANVAS_WIDTH * 2) - 380, CANVAS_HEIGHT - 423)

    this.cctx.font = '36px Arial'
    this.cctx.fillText(lotNumber, (CANVAS_WIDTH * 2) - 380, CANVAS_HEIGHT - 362)
  }

  getResult() {
    return this.cResult.toDataURL()
  }

  getResultBack() {
    return this.canvas.toDataURL()
  }

  getResultFront() {
    return this.canvasFront.toDataURL()
  }
}

export function loadImage(imagePath) {

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

export function filterImage(image, color) {
  const c = document.createElement('canvas')
  const cContext = c.getContext('2d')
  c.width = CANVAS_WIDTH
  c.height = CANVAS_HEIGHT

  cContext.globalCompositeOperation = 'source-over'
  cContext.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  cContext.fillStyle = color
  cContext.fillRect(0, 0, c.width, c.height)

  cContext.globalCompositeOperation = 'destination-in'
  cContext.drawImage(image, 0, 0, c.width, c.height)
  cContext.globalCompositeOperation = 'source-over'

  return loadImage(c.toDataURL())
}

export function loadFile(file) {
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

export function loadFileAsText(file) {
  return new Promise((resolve, reject) => {
    let fr = new FileReader()
    fr.onload = () => {
      resolve(fr.result)
    }
    fr.onerror = (err) => {
      reject(err)
    }
    fr.readAsText(file)
  })
}

export function formatDate(date = new Date()) {
  let dd = date.getDate()
  let mm = date.getMonth() + 1

  if (dd < 10)
    dd = '0' + dd

  if (mm < 10)
    mm = '0' + mm

  return dd + '/' + mm + '/' + date.getFullYear()
}