import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { ZodCollection } from '../src'
import { setupDb } from './util'

const Example = z.object({
  a: z.string(),
  b: z.number().optional(),
})

const initializeZodCollection = async () => {
  const db = await setupDb()
  return new ZodCollection(db, 'collection', Example)
}

test('insertOne', async () => {
  const collection = await initializeZodCollection()
  const result = await collection.insertOne({ a: 'a' })
  expect(result.acknowledged).toBeTruthy()
  expect(result.insertedId).toBeInstanceOf(ObjectId)
  const result2 = await collection.findOne({ a: 'a' })
  expect(result2?.createdAt).toBeInstanceOf(Date)
  expect(result2?.updatedAt).toBeInstanceOf(Date)
})

test('findOne', async () => {
  const collection = await initializeZodCollection()
  const result = await collection.insertOne({ a: 'a' })
  expect(result.acknowledged).toBeTruthy()

  const date = new Date()
  expect((await collection.findOne({ createdAt: { $lte: date } }))?.a).toEqual('a')
  expect(await collection.findOne({ createdAt: { $gt: date } })).toBeFalsy()
})
