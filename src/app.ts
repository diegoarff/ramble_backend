import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import router from './routes';

// Inits
const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(router);

export default app;
