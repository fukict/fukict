import type { Plugin } from 'vite';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

/**
 * Vite plugin that provides mock API endpoints via configureServer middleware.
 *
 * Routes:
 * - GET    /api/todos       → todo list
 * - POST   /api/todos       → create todo
 * - PUT    /api/todos/:id   → update todo
 * - DELETE /api/todos/:id   → delete todo
 * - GET    /api/error/400   → 400 response
 * - GET    /api/error/500   → 500 response
 * - GET    /api/slow        → 3s delayed response
 */
export function viteMockPlugin(): Plugin {
  return {
    name: 'vite-mock-api',
    configureServer(server) {
      let nextId = 4;
      const todos: Todo[] = [
        { id: 1, title: 'Learn Fukict', completed: true },
        { id: 2, title: 'Build an app', completed: false },
        { id: 3, title: 'Write tests', completed: false },
      ];

      function json(res: any, data: unknown, status = 200) {
        const body = JSON.stringify(data);
        res.writeHead(status, {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        });
        res.end(body);
      }

      function parseBody(req: any): Promise<any> {
        return new Promise((resolve, reject) => {
          let raw = '';
          req.on('data', (chunk: string) => (raw += chunk));
          req.on('end', () => {
            try {
              resolve(raw ? JSON.parse(raw) : {});
            } catch {
              reject(new Error('Invalid JSON'));
            }
          });
          req.on('error', reject);
        });
      }

      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? '';
        const method = req.method ?? 'GET';

        // ── GET /api/todos ──
        if (url === '/api/todos' && method === 'GET') {
          return json(res, todos);
        }

        // ── POST /api/todos ──
        if (url === '/api/todos' && method === 'POST') {
          try {
            const body = await parseBody(req);
            const todo: Todo = {
              id: nextId++,
              title: body.title ?? 'Untitled',
              completed: false,
            };
            todos.push(todo);
            return json(res, todo, 201);
          } catch {
            return json(res, { error: 'Invalid request body' }, 400);
          }
        }

        // ── PUT /api/todos/:id ──
        const putMatch = url.match(/^\/api\/todos\/(\d+)$/);
        if (putMatch && method === 'PUT') {
          const id = Number(putMatch[1]);
          const index = todos.findIndex(t => t.id === id);
          if (index === -1) {
            return json(res, { error: 'Todo not found' }, 404);
          }
          try {
            const body = await parseBody(req);
            if (body.title !== undefined) todos[index].title = body.title;
            if (body.completed !== undefined)
              todos[index].completed = body.completed;
            return json(res, todos[index]);
          } catch {
            return json(res, { error: 'Invalid request body' }, 400);
          }
        }

        // ── DELETE /api/todos/:id ──
        const deleteMatch = url.match(/^\/api\/todos\/(\d+)$/);
        if (deleteMatch && method === 'DELETE') {
          const id = Number(deleteMatch[1]);
          const index = todos.findIndex(t => t.id === id);
          if (index === -1) {
            return json(res, { error: 'Todo not found' }, 404);
          }
          const [removed] = todos.splice(index, 1);
          return json(res, removed);
        }

        // ── GET /api/error/400 ──
        if (url === '/api/error/400' && method === 'GET') {
          return json(
            res,
            { error: 'Bad Request', message: 'Missing required field' },
            400,
          );
        }

        // ── GET /api/error/500 ──
        if (url === '/api/error/500' && method === 'GET') {
          return json(
            res,
            { error: 'Internal Server Error', message: 'Something went wrong' },
            500,
          );
        }

        // ── GET /api/slow ──
        if (url === '/api/slow' && method === 'GET') {
          await new Promise(resolve => setTimeout(resolve, 3000));
          return json(res, {
            message: 'This response was delayed by 3 seconds',
          });
        }

        next();
      });
    },
  };
}
