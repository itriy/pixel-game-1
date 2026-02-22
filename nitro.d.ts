/// <reference types="nitropack" />

declare global {
  const defineEventHandler: (typeof import('nitropack'))['defineEventHandler'];
  const defineNitroConfig: (typeof import('nitropack'))['defineNitroConfig'];
}

export {};
