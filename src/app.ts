import cors from 'cors';
import express, { Response } from 'express';
import helmet from 'helmet';

function createServer() {
  const app = express();

  app.use(cors());
  app.use(helmet());

  app.use('/api/health', (_, res: Response) => res.status(200).send('OK! hlo'));

  return app;
}

export default createServer;
