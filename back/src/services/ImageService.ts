const path = require('path')
const sharp = require('sharp')
import { v4 as uuidv4 } from 'uuid';
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
}

class ImageResizeProvider {
  private folder: object

  constructor(folder: object) {
    this.folder = folder
  }

  async save(buffer: object) {
    const filename = ImageResizeProvider.filename()
    const filepath = this.filepath(filename)
    await sharp(buffer)
      .png({ compressionLevel: 9, adaptiveFiltering: true, force: true })
      .resize(800, 800, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
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