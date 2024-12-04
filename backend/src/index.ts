import express, {Request,  Response } from "express";
import dotenv from "dotenv";
import { createRecording } from './controllers';
import { generatePresignedUrl } from "./apis/supabase";

dotenv.config();
const app = express();
const PORT = 3000;

app.use(express.json());

// list recordings
app.get('/recordings', (req: Request, res: Response) => {
  res.send('get list of recordings');
});

// generate presigned url for audio upload
app.post('/recordings/:user_id/upload', async (req: Request, res: Response): Promise<any> => {
  const userId = req.params.user_id;
  const filename = req.body.filename;
  console.log(req.body);
  if (!userId || !filename) {
    return res.status(400).json({ error: 'Recording filename and User Id can\'t be empty' });
  }
  try {
    const signedUrl = await generatePresignedUrl(userId, filename);
    return res.json({signedUrl});
  } catch (error) {
    console.error(`Error while generating signed url for audio upload:`, error);
    return res.status(500).json({ error: "Failed to generate url" });
  }
});

app.get('/recordings/:user_id/:recording_id', (req: Request, res: Response) => {
  res.send('get one recording');
});

app.post('/recordings/:user_id', async (req: Request, res: Response): Promise<any> => {
  const recordingUrl = req.body.recording_url;
  const userId = req.params.user_id;
  if (!recordingUrl || !userId) {
    return res.status(400).json({ error: 'Recording URL and User Id can\'t be empty' });
  };
  const createRequest = {
    recordingUrl: req.body.recording_url,
    userId: req.params.user_id
  }
  try {
    const response = await createRecording(createRequest);
    return res.json(response);
  } catch (error) {
    console.error(`Error while creating record:`, error);
    return res.status(500).json({ error: "Failed to transcribe recording" });
  }
});

app.delete('/recordings/:user_id/:recording_id', (req: Request, res: Response) => {
  res.send('delete one recording');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});