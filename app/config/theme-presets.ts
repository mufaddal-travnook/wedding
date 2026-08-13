import type { ThemeColors, SkyGradient } from './types';

export const THEMES: Record<string, ThemeColors> = {
  entrance: {
    eyebrow: '#e8b86d',
    title: '#ffffff',
    body: '#f5e9dc',
    accent: '#f3c98a',
    shadow: 'rgba(25,18,50,0.6)',
  },
  nikah: {
    eyebrow: '#b3812e',
    title: '#5a4322',
    body: '#6d573a',
    accent: '#c9962e',
    shadow: 'rgba(255,244,224,0.9)',
  },
  mehendi: {
    eyebrow: '#9a7a00',
    title: '#2e5417',
    body: '#3d5a26',
    accent: '#d9a800',
    shadow: 'rgba(250,244,200,0.9)',
  },
  reception: {
    eyebrow: '#e8b86d',
    title: '#ffffff',
    body: '#e6ddff',
    accent: '#ffd27a',
    shadow: 'rgba(8,6,24,0.7)',
  },
};

export const SKIES: Record<string, SkyGradient> = {
  entrance: {
    stops: ['#2e2a52 0%', '#6b5b95 40%', '#e8a1a1 78%', '#ffd9b3 100%'],
    direction: 180,
  },
  nikah: {
    stops: ['#f8ecd9 0%', '#f3ddc0 38%', '#eec9a2 72%', '#f7e3c8 100%'],
    direction: 180,
  },
  mehendi: {
    stops: ['#7ec850 0%', '#a8d878 34%', '#f2e28a 74%', '#ffe9a8 100%'],
    direction: 180,
  },
  reception: {
    stops: ['#050514 0%', '#141033 45%', '#2a1d55 78%', '#3d2b63 100%'],
    direction: 180,
  },
};
