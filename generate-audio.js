// generate-audio.js
// Generates clean, crisp uncompressed PCM WAV audio files for CLUTCH audio stems
import fs from 'fs';
import path from 'path';

function createWavBuffer(sampleRate, samples) {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  
  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write('WAVE', 8);
  
  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // audio format (1 = PCM)
  buffer.writeUInt16LE(1, 22);  // num channels (1 = mono)
  buffer.writeUInt32LE(sampleRate, 24); // sample rate
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate (sampleRate * numChannels * bitsPerSample/8)
  buffer.writeUInt16LE(2, 32);  // block align (numChannels * bitsPerSample/8)
  buffer.writeUInt16LE(16, 34); // bits per sample
  
  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(samples.length * 2, 40);
  
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(s * 32767), 44 + i * 2);
  }
  
  return buffer;
}

const sampleRate = 44100;

// 1. beat_tick (0.15s percussive energetic beat tick)
{
  const duration = 0.15;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const freq = 520 * Math.exp(-t * 25);
    const env = Math.exp(-t * 28);
    const wave = Math.sin(2 * Math.PI * freq * t) * 0.7 + (Math.random() * 2 - 1) * 0.3 * Math.exp(-t * 50);
    samples[i] = wave * env;
  }
  const buf = createWavBuffer(sampleRate, samples);
  const dir = 'client/public/audio';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'beat_tick.wav'), buf);
  fs.writeFileSync(path.join(dir, 'beat_tick.mp3'), buf);
}

// 2. clutch_lock (0.6s heavy sub-bass impact + electric power lock)
{
  const duration = 0.65;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const subFreq = 140 * Math.exp(-t * 8) + 45;
    const sub = Math.sin(2 * Math.PI * subFreq * t);
    const chord = (Math.sin(2 * Math.PI * 220 * t) + Math.sin(2 * Math.PI * 277 * t) + Math.sin(2 * Math.PI * 330 * t)) / 3;
    const env = Math.exp(-t * 5);
    const punch = Math.exp(-t * 40) * 0.6;
    samples[i] = (sub * 0.6 + chord * 0.3 + punch) * env;
  }
  const buf = createWavBuffer(sampleRate, samples);
  const dir = 'client/public/audio';
  fs.writeFileSync(path.join(dir, 'clutch_lock.wav'), buf);
  fs.writeFileSync(path.join(dir, 'clutch_lock.mp3'), buf);
}

// 3. stage_call_ring (2.4s smartphone ringtone loop)
{
  const duration = 2.4;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let s = 0;
    // Ring bursts at 0-0.5s and 0.7-1.2s, then pause until 2.4s
    const inBurst1 = t < 0.45;
    const inBurst2 = t > 0.65 && t < 1.1;
    if (inBurst1 || inBurst2) {
      const burstT = inBurst1 ? t : t - 0.65;
      const f1 = 853;
      const f2 = 960;
      const env = Math.sin(Math.PI * (burstT / 0.45));
      s = (Math.sin(2 * Math.PI * f1 * t) * 0.5 + Math.sin(2 * Math.PI * f2 * t) * 0.5) * env * 0.5;
    }
    samples[i] = s;
  }
  const buf = createWavBuffer(sampleRate, samples);
  const dir = 'client/public/audio';
  fs.writeFileSync(path.join(dir, 'stage_call_ring.wav'), buf);
  fs.writeFileSync(path.join(dir, 'stage_call_ring.mp3'), buf);
}

console.log('Audio cues successfully generated in client/public/audio/');
