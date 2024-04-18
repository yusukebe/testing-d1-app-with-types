import { env } from 'cloudflare:test'
import { testClient } from 'hono/testing'
import api from '../src'

describe('Test the D1 application', () => {
  const client = testClient(api, env)

  const text = 'My first Post'
  let id = ''

  it('Should create a new post - POST /', async () => {
    const res = await client.api.$post({
      form: {
        text
      }
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.id).not.toBeUndefined()
    id = data.id
  })

  it('Should return a single post - GET /:id', async () => {
    const res = await client.api[':id'].$get({
      param: {
        id
      }
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.id).toBe(id)
    expect(data.text).toBe(text)
    expect(data.createdAt).not.toBeUndefined()
  })

  it('Should return all posts - GET /', async () => {
    const res = await client.api.$get()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.length).toBe(1)
  })
})
