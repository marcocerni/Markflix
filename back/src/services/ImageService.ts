import * as path from 'path'
import * as sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

const fs = require('fs')

const IMAGE_FOLDER_PATH = path.join(__dirname, '../../../front/public/images')

export class ImageService {

  static uploadImage(req: any): Promise<string> {

    return new Promise(async (resolve, reject) => {
      try {

        if (!req || !req.buffer)
          return reject(new Error('Please provide an image'))

        if (!fs.existsSync(IMAGE_FOLDER_PATH))
          fs.mkdirSync(IMAGE_FOLDER_PATH)

        const fileUpload = new ImageResizeProvider(IMAGE_FOLDER_PATH)

        const filename = await fileUpload.save(req.buffer)

        return resolve(filename)
      } catch (error) {
        return reject(error)
      }
    })
  }

  static deleteImage(filename: string) {
    fs.unlinkSync(`${IMAGE_FOLDER_PATH}/${filename}`)
  }

  static async createSachetImage(logo: string) {
    let parts = logo.split(';');
    let mimType = parts[0].split(':')[1];
    let imageData = parts[1].split(',')[1];

    const logoImage = await sharp(Buffer.from(imageData, 'base64')).resize({width: 250}).toBuffer();
    return sharp(__dirname +'/../static/Sachet.png')
      .composite([{ input: await sharp(logoImage).toBuffer(), top: 160, left: 75}]).webp().toBuffer()
  }
}

class ImageResizeProvider {
  private folder: string

  constructor(folder: string) {
    this.folder = folder
  }

  async save(buffer: object) {
    const filename = ImageResizeProvider.filename()
    const filepath = this.filepath(filename)
    await sharp(buffer)
      .rotate()
      .png({ compressionLevel: 9, adaptiveFiltering: true, force: true })
      .resize(800, 800, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .withMetadata()
      .toFile(filepath)

    return filename
  }

  static filename() {
    return `${uuidv4()}.png`
  }

  filepath(filename: String) {
    return path.resolve(`${this.folder}/${filename}`)
  }
}