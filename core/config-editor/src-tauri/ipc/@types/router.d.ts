declare module 'router' {
  import { IncomingMessage, ServerResponse } from 'http';

  interface RouterRequest extends IncomingMessage {
    params?: { [key: string]: string };
    query?: { [key: string]: string | string[] };
    body?: any;
  }

  type NextFunction = (err?: any) => void;
  
  type RouteHandler = (
    req: RouterRequest,
    res: ServerResponse,
    next: NextFunction
  ) => void;

  type MiddlewareHandler = (
    req: IncomingMessage,
    res: ServerResponse,
    next: NextFunction
  ) => void;

  interface Router {
    (req: IncomingMessage, res: ServerResponse, next?: NextFunction): void;
    
    // HTTP methods
    get(path: string, handler: RouteHandler): Router;
    post(path: string, handler: RouteHandler): Router;
    put(path: string, handler: RouteHandler): Router;
    delete(path: string, handler: RouteHandler): Router;
    patch(path: string, handler: RouteHandler): Router;
    head(path: string, handler: RouteHandler): Router;
    options(path: string, handler: RouteHandler): Router;
    all(path: string, handler: RouteHandler): Router;
    
    // Middleware
    use(handler: MiddlewareHandler): Router;
    use(path: string, handler: MiddlewareHandler): Router;
    use(path: string, router: Router): Router;
  }

  interface RouterConstructor {
    (): Router;
    new (): Router;
  }

  const Router: RouterConstructor;
  export = Router;
}
