import type { Response } from 'express';

class BaseController {
  protected successRes<T>(
    res: Response,
    statusCode = 200,
    message: string,
    data?: T,
  ): Response {
    if (!data) {
      return res.status(statusCode).json({
        status: 'success',
        message,
      });
    }

    return res.status(statusCode).json({
      status: 'success',
      message,
      data,
    });
  }

  protected errorRes<T>(
    res: Response,
    statusCode = 400,
    message: string,
    errors?: T,
  ): Response {
    if (!errors) {
      return res.status(statusCode).json({
        status: 'error',
        message,
      });
    }

    return res.status(statusCode).json({
      status: 'error',
      message,
      errors,
    });
  }
}

export default BaseController;
