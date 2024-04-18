import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1'
import { createInsertSchema } from 'drizzle-zod'
import { Hono } from 'hono'
import { showRoutes } from 'hono/dev'
import { z } from 'zod'
import { posts } from './schema'

type Env = {
  Bindings: {
    DB: D1Database
  }
  Variables: {
    db: DrizzleD1Database
  }
}

const app = new Hono<Env>().basePath('/api')

app.use(async (c, next) => {
  c.set('db', drizzle(c.env.DB))
  await next()
})

const insertSchema = createInsertSchema(posts, {
  id: z.undefined()
})

const routes = app
  .get('/', async (c) => {
    const results = await c.var.db.select().from(posts).all()
    return c.json(results)
  })
  .post('/', zValidator('form', insertSchema), async (c) => {
    const { text } = c.req.valid('form')
    const id = crypto.randomUUID()
    const results = await c.var.db.insert(posts).values({ id, text }).returning()
    return c.json(results[0])
  })
  .get(
    '/:id',
    zValidator(
      'param',
      z.object({
        id: z.string()
      })
    ),
    async (c) => {
      const { id } = c.req.valid('param')
      const results = await c.var.db.select().from(posts).where(eq(posts.id, id))
      return c.json(results[0])
    }
  )

showRoutes(app)

export default routes
