import { Router } from 'express'
import SachetController from '../controllers/SachetController'
import { checkJwt } from '../middlewares/checkJwt'
import { checkRole } from '../middlewares/checkRole'
import * as multer from "multer";

const router = Router()

router.get('/', [checkJwt, checkRole(['ADMIN'])], SachetController.listAll)

router.get('/unsubscribe', [checkJwt, checkRole(['ADMIN'])], SachetController.getUnsubscribedEmails)

router.get(
  '/:id',
  [],
  SachetController.getOneById,
)

router.get(
  '/:id/logo',
  [],
  SachetController.getLogo,
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

//Delete one user
router.post(
  '/massive',
  [checkJwt, checkRole(['ADMIN'])],
  SachetController.massiveSend,
)

router.post('/unsubscribe', [checkJwt, checkRole(['ADMIN'])], SachetController.unsubscribeEmails)

router.post('/unsubscribe/:id', SachetController.unsubscribeSachet)

export default router