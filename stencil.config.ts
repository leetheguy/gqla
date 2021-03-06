import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'gqla',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader'
    },
    {
      type: 'docs-readme'
    },
    {
      type: 'www',
      serviceWorker: null // disable service workers
    }
  ],
  globalStyle: 'src/assets/css/global.css',
};
