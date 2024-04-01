import express, { Request, Response } from 'express';
import { createClient } from 'redis';

const redisHost = process.env.REDIS_HOST || 'localhost';

const app = express();

async function main() {
  const client = await createClient({
    url: `redis://${redisHost}:6379`
  })
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

  app.get('/', async (req: Request, res: Response) => {
    try {
      const keys = await client.keys('*');
      const keyValuePairs: { [key: string]: any } = {};

      for (const key of keys) {
        const type = await client.type(key);

        switch (type) {
          case 'string':
            keyValuePairs[key] = await client.get(key);
            break;
          case 'list':
            keyValuePairs[key] = await client.lRange(key, 0, -1);
            break;
          case 'set':
            keyValuePairs[key] = await client.sMembers(key);
            break;
          case 'zset':
            keyValuePairs[key] = await client.zRange(key, 0, -1);
            break;
          case 'hash':
            keyValuePairs[key] = await client.hGetAll(key);
            break;
          default:
            keyValuePairs[key] = null;
        }
      }

      res.send(keyValuePairs);
    } catch (err) {
      console.log(err)
      res.status(500).send('Error retrieving Redis keys and values');
    }
  });

  app.listen(8080, () => {
    console.log('Server is running on port 8080');
  });
}

main();