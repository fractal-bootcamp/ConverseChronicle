import express, { Request, Response } from 'express';
import dotenv from "dotenv";

// Load .env file contents into process.env
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// list recordings
app.get('/recordings', (req: Request, res: Response) => {
  res.send('get list of recordings');
});

app.get('/recordings/:user_id/:recording_id', (req: Request, res: Response) => {
  res.send('get one recording');
});

app.post('/recordings/:user_id/', (req: Request, res: Response) => {
  res.send('create recording');
});

app.delete('/recordings/:user_id/:recording_id', (req: Request, res: Response) => {
  res.send('delete one recording');
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});