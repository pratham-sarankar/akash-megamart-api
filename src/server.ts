import 'dotenv/config.js';
import express, {Application, json, NextFunction, Request, Response} from 'express';
import cors from 'cors';
import morgan from 'morgan';

// Import all routes
import user_routes from "./routes/user_routes";

const app: Application = express();

app.use(json());
app.use(cors());
app.use(morgan('dev'));


app.use('/users', user_routes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({
        status: 'error',
        data: null,
        message: err.message
    });
});

app.listen(3000, () => {
    console.log('App listening on port 3000!');
});

