import { Router } from 'express';
import { AuthController } from '../controllers';
import { validate } from '../middlewares';
import { signUpSchema, signInSchema } from '../zod';

const router = Router();

router.post('/signup', validate(signUpSchema), AuthController.signUp);

router.post('/signin', validate(signInSchema), AuthController.signIn);

export default router;
