import jsonServer from 'json-server';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();
const failProbability = 0.25;

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.disable('etag');

server.use((req: Request, res: Response, next: NextFunction) => {
    if (Math.random() < failProbability) {
        res.status(500).jsonp({
            error: 'Internal Server Error',
            message: '요청을 처리할 수 없습니다. 나중에 다시 시도해주세요.',
        });
    } else {
        next();
    }
});

server.use(router);

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`JSON Server is running on port ${PORT}`);
});
