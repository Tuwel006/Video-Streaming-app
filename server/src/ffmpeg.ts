import { spawn } from 'child_process';
import * as mediasoup from 'mediasoup';

let ffmpeg: any;

const startRecording = (rtpParameters: mediasoup.types.RtpParameters) => {
  const videoCodec = rtpParameters.codecs.find(c => c.mimeType.toLowerCase().startsWith('video/'));
  const audioCodec = rtpParameters.codecs.find(c => c.mimeType.toLowerCase().startsWith('audio/'));

  const command = 'ffmpeg';
  const args = [
    '-loglevel',
    'debug',
    '-protocol_whitelist',
    'file,udp,rtp',
    '-i',
    'pipe:0',
    '-map',
    '0:v:0',
    '-map',
    '0:a:0',
    '-c:v',
    'copy',
    '-c:a',
    'copy',
    '-f',
    'webm',
    `server/videos/${Date.now()}.webm`,
  ];

  console.log('Starting FFmpeg with command:', command, args.join(' '));

  ffmpeg = spawn(command, args);

  ffmpeg.on('error', (err: any) => {
    console.error('FFmpeg error:', err);
  });

  ffmpeg.stderr.on('data', (data: any) => {
    console.error('FFmpeg stderr:', data.toString());
  });

  ffmpeg.on('close', (code: any) => {
    console.log('FFmpeg process closed with code:', code);
  });

  return ffmpeg;
};

export { startRecording };
