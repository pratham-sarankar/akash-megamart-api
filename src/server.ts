import 'dotenv/config.js';
import express, {Application, json, NextFunction, Request, Response} from 'express';
import cors from 'cors';
import morgan from 'morgan';

// Import all routes
import user_routes from "./routes/user_routes";
import product_routes from "./routes/product_routes";
import wishlist_routes from "./routes/wishlist_routes";
import cart_routes from "./routes/cart_routes";
import sync_routes from "./routes/sync_routes";
import order_routes from "./routes/order_routes";
import image_routes from "./routes/image_routes";

const app: Application = express();

app.use(json({
    limit: '50mb'
}));
app.use(cors());
app.use(morgan('dev'));

app.use("/sync", sync_routes);
app.use('/users', user_routes);
app.use("/products", product_routes);
app.use("/wishlist", wishlist_routes);
app.use("/cart", cart_routes);
app.use("/orders", order_routes);
app.use("/images", image_routes);

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

