/* eslint-disable no-console */
import { StatusCode } from '../constants/http';
import { logger } from '../utils/logger';

import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

import { randomUUID } from 'crypto';

interface RequestParams extends Request {
  requestId?: string;
  log?: {
    error: (label: string, ...args: unknown[]) => void;
    warn: (label: string, ...args: unknown[]) => void;
    info: (label: string, ...args: unknown[]) => void;
  };
}

class ApiMiddleware {
  static notFound = (_: Request, res: Response): void => {
    res.status(StatusCode.NOT_FOUND);
    res.send({ message: 'Requested Resource Not Found' });
    res.end();
  };

  // err, req, res and next must be present to act as an error middleware
  static error = (err: ErrorRequestHandler, req: RequestParams, res: Response): void => {
    req?.log?.error(
      'Unhandled Error',
      {
        path: req.path,
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers,
      },
      err
    );

    res.status(StatusCode.SERVER_ERROR);
    res.send({ requestId: req.requestId, message: 'Internal Server Error' });
    res.end();
  };

  static syntaxError = (
    err: SyntaxError,
    req: RequestParams,
    res: Response,
    next: NextFunction
  ): void => {
    if (err instanceof SyntaxError && 'body' in err) {
      req?.log?.warn('Syntax Error', err);
      res.status(StatusCode.BAD_REQUEST).send({
        requestId: req.requestId,
        message: 'Syntax Error. Check your request body.',
      });
      return;
    }
    next();
  };

  static requestId = (req: RequestParams, _: Response, next: NextFunction): void => {
    req.requestId = randomUUID();
    next();
  };

  static logIncomingRequest = (req: RequestParams, _: Response, next: NextFunction): void => {
    const endpoint = `${req?.method} ${req?.originalUrl}`;
    req?.log?.info(
      'Incoming Request',
      JSON.stringify({
        endpoint,
        body: req.body,
        query: req.query,
        params: req.params,
      })
    );
    next();
  };

  static logHelper = (req: RequestParams, _res: Response, next: NextFunction): void => {
    const { requestId } = req;
    req.log = {
      info: (label: string, ...args: unknown[]) => logger.info(`[${requestId}]`, label, ...args),
      warn: (label: string, ...args: unknown[]) => logger.warn(`[${requestId}]`, label, ...args),
      error: (label: string, ...args: unknown[]) => logger.error(`[${requestId}]`, label, ...args),
    };
    next();
  };
}

export default ApiMiddleware;
