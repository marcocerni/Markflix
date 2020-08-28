import { Router } from 'express'
import SachetController from '../controllers/SachetController'
import { checkJwt } from '../middlewares/checkJwt'
import { checkRole } from '../middlewares/checkRole'
import * as multer from "multer";

const router = Router()

router.get('/', [checkJwt, checkRole(['ADMIN'])], SachetController.listAll)

router.get(
  '/:id',
  [],
  SachetController.getOneById,
)

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', [upload.any()], SachetController.newSachet)

//Edit one user
router.patch(
  '/:id',
  [upload.any()],
  SachetController.editSachet,
)

//Delete one user
router.delete(
  '/:id',
  [checkJwt, checkRole(['ADMIN'])],
  SachetController.deleteSachet,
)

export default router