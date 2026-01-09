import { createServer } from 'http';
import app from './app';
import { config } from './config';
import { pool } from './config/database';
import { initializeSocket } from './sockets';
import { timerService } from './services/timer.service';

const httpServer = createServer(app);
const io = initializeSocket(httpServer);

// Verify database connection on startup
pool.query('SELECT NOW()').catch((err) => console.error('Database connection failed:', err.message));

timerService.setOnTimerEnd(async (pollId) => {
  const { voteService } = await import('./services/vote.service');
  const results = await voteService.getPollResults(pollId);
  io.emit('poll:ended', { pollId, results });
});

timerService.setOnTimerTick((pollId, remaining) => {
  io.emit('timer:tick', { pollId, remainingTime: remaining });
});

timerService.restoreTimer().catch(console.error);

httpServer.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  httpServer.close(() => process.exit(0));
});

export default httpServer;
