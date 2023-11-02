import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import router from './routes';
import { passportMiddleware } from './middlewares';

// Inits
const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
passport.use(passportMiddleware);

app.use(router);

export default app;
