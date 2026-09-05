import { createApp } from './app.js';
import { config } from './config/env.js';

const { app } = createApp();

app.listen(config.port, () => {
  console.log(`Servidor notifications-service iniciado en el puerto ${config.port}`);
  console.log(`Ambiente: ${config.nodeEnv}`);
});
