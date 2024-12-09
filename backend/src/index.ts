import express, {Request,  Response } from "express";
import dotenv from "dotenv";
import { createRecording, deleteRecording, getRecording, listRecordings, updateRecording } from './controllers';
import {
  clerkMiddleware,
  getAuth,
  requireAuth, 
} from "@clerk/express";
import { GetRequest, DeleteRequest, UpdateRequest } from "./model";
import cors from "cors";
import multer from 'multer';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(clerkMiddleware({debug: true}));
app.use(cors());
const storage = multer.memoryStorage();
const upload = multer({ storage });

// list recordings
app.get('/recordings', requireAuth(), async (req: Request, res: Response): Promise<any> => {
  const {userId} = getAuth(req);
  console.log(`userId: `, userId);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const recordingsInfo = await listRecordings({userId});
    recordingsInfo.sort((a, b) => (b.updatedAt as any )- (a.updatedAt as any));
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
    console.log('recording', recording);
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
app.post('/recordings/create', requireAuth({debug: true}), upload.single('file'), async (req: Request, res: Response): Promise<any> => {
  const recordingBody = req.file;
  const {userId} = getAuth(req);
  if (!recordingBody || !userId) {
    return res.status(400).json({ error: 'Recording body and User Id can\'t be empty' });
  };
  console.log(`got request for user: `, userId);
  try {
    const response = await createRecording( {recordingBody: recordingBody.buffer, userId});
    console.log(`got response: `, JSON.stringify(response, null, 2));
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
  const deleteRequest: DeleteRequest = {
    userId,
    recordingId
  }
  try {
    const deleted = await deleteRecording(deleteRequest);
    console.log('deleted recording', deleted);
    return res.status(200).json({
        success: true,
        message: "Recording deleted successfully"
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error('Error: The record you tried to delete does not exist.');
      return res.status(400).json({ error: "The conversation you tried to delete does not exist" });
    }
    console.error(`Error while deleting recording:`, error);
    return res.status(500).json({ error: "Failed to delete recording" });
    
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
    } 
    console.error(`Error while updating recording:`, error);
    return res.status(500).json({ error: "Failed to update recording" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


// Deprecated
// generate presigned url for audio upload
// app.post('/recordings/upload', requireAuth(), async (req: Request, res: Response): Promise<any> => {
//   const {userId} = getAuth(req);
//   if (!userId) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }
//   const filename = `recording_${Date.now()}`;
//   try {
//     const signedUrl = await generatePresignedUrl(userId, filename);
//     return res.status(200).json({
//         success: true,
//         data: { signedUrl },
//         message: "Signed URL generated successfully"
//     });
//   } catch (error) {
//     console.error(`Error while generating signed url for audio upload:`, error);
//     return res.status(500).json({ error: "Failed to generate url" });
//   }
// });