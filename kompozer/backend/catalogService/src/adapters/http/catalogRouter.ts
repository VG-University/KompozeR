// catalogRouter — Express router per gli endpoint sotto /catalog.
// Ruoli:
//   - GET  /catalog        — pubblico (GUEST, BASE, ADMIN)
//   - GET  /catalog/:id    — pubblico
//   - GET  /catalog/health — pubblico (Spring Actuator equivalent)
//   - POST /catalog        — ADMIN only
//   - PUT  /catalog/:id    — ADMIN only
//   - DELETE /catalog/:id  — ADMIN only
//
// Il controllo del ruolo ADMIN si basa sull'header X-User-Role iniettato dal
// gateway dopo la verifica JWT. Il router non tocca mai il JWT raw.
import { Router, Request, Response, NextFunction } from 'express';
import { ListComponents }  from '../../useCases/ListComponents';
import { GetComponent }    from '../../useCases/GetComponent';
import { CreateComponent } from '../../useCases/CreateComponent';
import { UpdateComponent } from '../../useCases/UpdateComponent';
import { DeleteComponent } from '../../useCases/DeleteComponent';
import { ComponentCategory } from '../../domain/entities/ComponentCategory';

export interface CatalogRouterDeps {
  listComponents:  ListComponents;
  getComponent:    GetComponent;
  createComponent: CreateComponent;
  updateComponent: UpdateComponent;
  deleteComponent: DeleteComponent;
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const role = req.headers['x-user-role'];
  if (role !== 'ADMIN') {
    res.status(403).json({ code: 'FORBIDDEN', message: 'Admin role required' });
    return;
  }
  next();
}

function wrap(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);
}

export function buildCatalogRouter(deps: CatalogRouterDeps): Router {
  const router = Router();

  // GET /catalog/health — health check (deve stare prima di /:id)
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // GET /catalog — lista paginata e filtrata
  router.get(
    '/',
    wrap(async (req, res) => {
      const { category, minPrice, maxPrice, available, search, page, limit } = req.query;
      const result = await deps.listComponents.execute({
        category:  category ? (category as ComponentCategory) : undefined,
        minPrice:  minPrice  ? Number(minPrice)  : undefined,
        maxPrice:  maxPrice  ? Number(maxPrice)  : undefined,
        available: available !== undefined ? available === 'true' : undefined,
        search:    search    ? String(search)    : undefined,
        page:      page      ? Number(page)      : undefined,
        limit:     limit     ? Number(limit)     : undefined,
      });
      res.json(result);
    }),
  );

  // GET /catalog/:id — singolo componente
  router.get(
    '/:id',
    wrap(async (req, res) => {
      const dto = await deps.getComponent.execute({ id: req.params['id'] });
      res.json(dto);
    }),
  );

  // POST /catalog — crea componente (ADMIN)
  router.post(
    '/',
    requireAdmin,
    wrap(async (req, res) => {
      const userId = req.headers['x-user-id'] as string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dto = await deps.createComponent.execute({
        ...(req.body as any),
        requestingUserId: userId,
      });
      res.status(201).json(dto);
    }),
  );

  // PUT /catalog/:id — aggiorna componente (ADMIN)
  router.put(
    '/:id',
    requireAdmin,
    wrap(async (req, res) => {
      const userId = req.headers['x-user-id'] as string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dto = await deps.updateComponent.execute({
        ...(req.body as any),
        id:               req.params['id'],
        requestingUserId: userId,
      });
      res.json(dto);
    }),
  );

  // DELETE /catalog/:id — elimina componente (ADMIN)
  router.delete(
    '/:id',
    requireAdmin,
    wrap(async (req, res) => {
      await deps.deleteComponent.execute({ id: req.params['id'] });
      res.status(204).send();
    }),
  );

  return router;
}
