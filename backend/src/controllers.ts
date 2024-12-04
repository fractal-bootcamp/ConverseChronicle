import { transcribeUrl } from "./apis/transcribe";
import { CreateRequest } from "./model";

export const createRecording = async (req: CreateRequest) => {
    const {userId, recordingUrl} = req;
    const response = await transcribeUrl(recordingUrl);
    // todo: save to db
    // todo: return response
    return response;
};