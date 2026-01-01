// zalo-qr-worker.ts
import { Zalo } from 'zca-js';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from 'redis';

// Redis client
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
});

// Handle Redis connection errors
redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
  process.exit(1);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

async function createSession() {
  const sessionId = uuidv4();
  const expirationTime = Date.now() + 60000;
  const result: any = { sessionId, expirationTime };

  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    const zalo = new Zalo({
      selfListen: false,
      checkUpdate: true,
      logging: true,
    });

    zalo.loginQR({ userAgent: '', qrPath: '' }, async (qrData) => {
      try {
        if (qrData?.data && 'image' in qrData.data) {
          result.qrImage = qrData.data.image;
          await redisClient.set(
            `zalo:session:${sessionId}`,
            JSON.stringify({ ...result, isLoggedIn: false }),
            {
              EX: 60, // Set TTL to 60 seconds
            },
          );
          if (process.send) process.send(result);
        }
        if (qrData?.data && 'cookie' in qrData.data) {
          const sessionData = await redisClient.get(
            `zalo:session:${sessionId}`,
          );
          if (sessionData) {
            const session = JSON.parse(sessionData);
            session.isLoggedIn = true;
            session.cookie = qrData.data.cookie;
            session.imei = qrData.data.imei;
            session.userAgent = qrData.data.userAgent;

            await redisClient.set(
              `zalo:session:${sessionId}`,
              JSON.stringify(session),
              {
                EX: 60, // Set TTL to 60 seconds
              },
            );
            if (process.send) process.send(session);
            process.exit(0);
          }
        }
      } catch (err) {
        console.error('Error handling QR data:', err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error('Worker error:', err);
    process.exit(1);
  }
}

async function getInfo(session) {
  try {
    const zalo = new Zalo({
      selfListen: false,
      checkUpdate: true,
      logging: true,
    });

    const api = await zalo.login({
      cookie: session.cookie,
      imei: session.imei,
      userAgent: session.userAgent,
    });

    const userId = api.getOwnId();
    const res = await api.getUserInfo(userId);

    return res.changed_profiles[userId];
  } catch (error) {
    console.log(error);
    return null;
  }
}

process.on(
  'message',
  async (
    msg: { type: 'gen-qr' } | { type: 'check-login'; sessionId: string },
  ) => {
    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }

      if (msg.type === 'gen-qr') {
        await createSession();
      } else if (msg.type === 'check-login' && msg.sessionId) {
        const sessionData = await redisClient.get(
          `zalo:session:${msg.sessionId}`,
        );

        if (sessionData) {
          const session = JSON.parse(sessionData);
          if (process.send) {
            let data;
            if (session.cookie) {
              data = await getInfo(session);
            }
            process.send({
              loggedIn: session.isLoggedIn,
              data,
              session,
            });
          }
        } else {
          if (process.send) {
            process.send({
              error: 'Session không tồn tại',
              sessionId: msg.sessionId,
            });
          }
        }
        setTimeout(() => process.exit(0), 100);
      }
    } catch (err) {
      console.error('Worker error:', err);
      process.exit(1);
    }
  },
);

// Handle process termination
process.on('SIGTERM', async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  } catch (err) {
    console.error('Error closing Redis connection:', err);
  }
  process.exit(0);
});
