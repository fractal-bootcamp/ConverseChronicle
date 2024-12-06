import express, {Request,  Response } from "express";
import dotenv from "dotenv";
import { createRecording, deleteRecording, getRecording, listRecordings, updateRecording } from './controllers';
import { generatePresignedUrl } from "./apis/supabase";
import {
  clerkMiddleware,
  getAuth,
  requireAuth, 
} from "@clerk/express";
import { GetRequest, DeleteRequest, UpdateRequest, CreateRequest } from "./model";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(clerkMiddleware());
app.use(cors());

// list recordings
app.get('/recordings/', requireAuth(), async (req: Request, res: Response): Promise<any> => {
  const {userId} = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const recordingsInfo = await listRecordings({userId});
    return res.status(200).json({
        success: true,
        data: recordingsInfo,
        message: "Conversations retrieved successfully"
    });
  } catch(error) {
    console.error(`Error while retrieving conversations:`, error);
    return res.status(500).json({ error: "Failed to retrieve conversations" });
  }
});

// generate presigned url for audio upload
app.post('/recordings/upload', requireAuth(), async (req: Request, res: Response): Promise<any> => {
  const {userId} = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const filename = `recording_${Date.now()}`;
  if (!filename) {
    return res.status(400).json({ error: 'Recording filename and User Id can\'t be empty' });
  }
  try {
    const signedUrl = await generatePresignedUrl(userId, filename);
    return res.status(200).json({
        success: true,
        data: { signedUrl },
        message: "Signed URL generated successfully"
    });
  } catch (error) {
    console.error(`Error while generating signed url for audio upload:`, error);
    return res.status(500).json({ error: "Failed to generate url" });
  }
});

// get single recording
app.get('/recordings/:recording_id', requireAuth(), async (req: Request, res: Response): Promise<any> => {
  const {userId} = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const recordingId = req.params.recording_id;
  if (!recordingId) {
    return res.status(400).json({ error: "Recording Id can't be empty" });
  }
  const getRequest: GetRequest = {
    userId,
    recordingId
  }
  try {
    const recording = await getRecording(getRequest);
    if (!recording) {
      return res.status(404).json({ error: `Recording ${recordingId} not found` });
    }
    return res.status(200).json({
        success: true,
        data: recording,
        message: "Recording retrieved successfully"
    });
  } catch (error) {
    console.error(`Error while getting recording:`, error);
    return res.status(500).json({ error: "Failed to get recording" });
  }
});

// create recording
app.post('/recordings/create', requireAuth(), async (req: Request, res: Response): Promise<any> => {
  const recordingUrl = req.body.recording_url;
  const {userId} = getAuth(req);
  if (!recordingUrl || !userId) {
    return res.status(400).json({ error: 'Recording URL and User Id can\'t be empty' });
  };
  const createRequest: CreateRequest = {
    recordingUrl: req.body.recording_url,
    userId: req.params.user_id
  }
  try {
    const response = await createRecording(createRequest);
    return res.status(200).json({
        success: true,
        data: response,
        message: "Recording created successfully"
    });
  } catch (error) {
    console.error(`Error while creating record:`, error);
    return res.status(500).json({ error: "Failed to transcribe recording" });
  }
});

// delete recording
app.delete('/recordings/:recording_id', requireAuth(), async (req: Request, res: Response): Promise<any> => {
  const {userId} = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const recordingId = req.params.recording_id;
  if (!recordingId) {
    return res.status(400).json({ error: "Recording Id can't be empty" });
  }
  const deleteRequest: DeleteRequest = {
    userId,
    recordingId
  }
  try {
    const deleted = await deleteRecording(deleteRequest);
    if (!deleted) {
      return res.status(404).json({ error: `Recording ${recordingId} not found` });
    }
    console.log('deleted recording', deleted);
    return res.status(200).json({
        success: true,
        message: "Recording deleted successfully"
    });
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

// update recording
app.put('/recordings/:recording_id', requireAuth(), async (req: Request, res: Response): Promise<any> => {
  const {userId} = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const recordingId = req.params.recording_id;
  const {title, transcript} = req.body;
  if (!recordingId) {
    return res.status(400).json({ error: 'Recording Id and User Id can\'t be empty' });
  }
  if (!title || !transcript) {
    return res.status(400).json({ error: 'Title and transcript can\'t be empty' });
  }
  const updateRequest: UpdateRequest = {
    userId,
    recordingId,
    title,
    transcript
  }
  try {
    const updated = await updateRecording(updateRequest);
    if (!updated) {
      return res.status(404).json({ error: `Recording ${recordingId} not found` });
    }
    return res.status(200).json({
        success: true,
        message: "Recording updated successfully"
    });
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