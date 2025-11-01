import { Config } from '../src/config/index.js';
import app from './app.js';

const startServer = () => {
  const PORT = Config.PORT;
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server', error);
    process.exit(1);
  }
};

startServer();
