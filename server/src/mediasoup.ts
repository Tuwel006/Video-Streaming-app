import * as mediasoup from 'mediasoup';
import os from 'os';

let worker: mediasoup.types.Worker;
let router: mediasoup.types.Router;

const mediaCodecs: mediasoup.types.RtpCodecCapability[] = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {
      'x-google-start-bitrate': 1000,
    },
  },
];

const createWorker = async () => {
  const numWorkers = Object.keys(os.cpus()).length;
  console.log(`System has ${numWorkers} CPU cores.`);

  worker = await mediasoup.createWorker({
    logLevel: 'warn',
    rtcMinPort: 20000,
    rtcMaxPort: 20200,
  });

  worker.on('died', () => {
    console.error('Mediasoup worker has died. Exiting...');
    process.exit(1);
  });

  console.log(`✅ Mediasoup worker created with PID: ${worker.pid}`);
  return worker;
};

const createRouter = async (worker: mediasoup.types.Worker) => {
  router = await worker.createRouter({ mediaCodecs });
  console.log(`✅ Mediasoup router created.`);
  return router;
};

const getMediasoupRouter = () => router;

export { createWorker, createRouter, getMediasoupRouter };
