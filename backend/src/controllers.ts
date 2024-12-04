import { CreateRequest } from "./model";

export const createRecording= async (req: CreateRequest, res: Response) => {
    const {user_id, recording} = req;
    // save to s3 
    // call deepgram API for transcript
    // call openai API for summarization
    // save to db
    // return response
  };