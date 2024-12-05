import express, {Request,  Response } from "express";
import dotenv from "dotenv";
import { createRecording, deleteRecording, getRecording, listRecordings, updateRecording } from './controllers';
import { generatePresignedUrl } from "./apis/supabase";

dotenv.config();
const app = express();
const PORT = 3000;

app.use(express.json());

// list recordings
app.get('/recordings/:user_id', async (req: Request, res: Response): Promise<any> => {
  const {user_id} = req.params;
  try {
    const recordingsInfo = await listRecordings({userId: user_id});
    return res.json(recordingsInfo);
  } catch(error) {
    console.error(`Error while retrieving conversations:`, error);
    return res.status(500).json({ error: "Failed to retrieve conversations" });
  }
});

// generate presigned url for audio upload
app.post('/recordings/:user_id/upload', async (req: Request, res: Response): Promise<any> => {
  const userId = req.params.user_id;
  const filename = req.body.filename;
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

// get single recording
app.get('/recordings/:user_id/:recording_id', async (req: Request, res: Response): Promise<any> => {
  const {user_id, recording_id} = req.params;
  if (!user_id || !recording_id) {
    return res.status(400).json({ error: 'Recording Id and User Id can\'t be empty' });
  }
  const getRequest = {
    userId: user_id,
    recordingId: recording_id
  }
  try {
    const recording = await getRecording(getRequest);
    if (!recording) {
      return res.status(404).json({ error: `Recording ${recording_id} not found` });
    }
    return res.json(recording);
  } catch (error) {
    console.error(`Error while getting recording:`, error);
    return res.status(500).json({ error: "Failed to get recording" });
  }
});

// create recording
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

// delete recording
app.delete('/recordings/:user_id/:recording_id', async (req: Request, res: Response): Promise<any> => {
  const {user_id, recording_id} = req.params;
  if (!user_id || !recording_id) {
    return res.status(400).json({ error: 'Recording Id and User Id can\'t be empty' });
  }

  try {
    const result = await deleteRecording({
      userId: user_id,
      recordingId: recording_id
    });
    return res.status(200).json({message: "successfully deleted conversation"});
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error('Error: The record you tried to delete does not exist.');
      return res.status(400).json({ error: "The conversation you tried to delete does not exist" });
    } else {
      console.error(`Error while deleting recording:`, error);
      return res.status(500).json({ error: "Failed to delete recording" });
    }
  }
});

app.put('/recordings/:user_id/:recording_id', async (req: Request, res: Response): Promise<any> => {
  const {user_id, recording_id} = req.params;
  const {title, transcript} = req.body;
  if (!user_id || !recording_id) {
    return res.status(400).json({ error: 'Recording Id and User Id can\'t be empty' });
  }
  if (!title || !transcript) {
    return res.status(400).json({ error: 'Title and transcript can\'t be empty' });
  }

  try {
    const result = await updateRecording({
      userId: user_id,
      recordingId: recording_id,
      title,
      transcript
    });
    return res.status(200).json({message: "successfully updated conversation"});
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error('Error: The record you tried to update does not exist.');
      return res.status(400).json({ error: "The conversation you tried to update does not exist" });
    } else {
      console.error(`Error while updating recording:`, error);
      return res.status(500).json({ error: "Failed to update recording" });
    }
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});