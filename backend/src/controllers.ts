import { PrismaClient } from '@prisma/client';
import { transcribeUrl } from "./apis/transcribe";
import { CreateRequest, GetRequest, ListRequest, DeleteRequest, UpdateRequest } from "./model";
import { downloadFile, uploadBuffer } from './apis/supabase';
import { v4 as uuid } from 'uuid';
import { BUCKET_NAME, FILE_EXTENSION } from './constant';

const prisma = new PrismaClient();

export const createRecording = async(req: CreateRequest) => {
    const {userId, recordingUrl, buffer} = req;

    // todo: use buffer option
    // const {transcript, shortSummary, allTopics, allIntents} = await transcribeFile(buffer!);
    const {transcript, shortSummary, allTopics, allIntents} = await transcribeUrl(recordingUrl);

    const recordingId = uuid();
    const filePath = `${userId}/${recordingId}` + FILE_EXTENSION;
    // upload audio to supabase storage
    if (buffer) {
        const {id, path, fullPath} = await uploadBuffer(BUCKET_NAME, filePath, buffer, "audio/x-m4a");
        console.log('uploaded buffer', id, path, fullPath);
    }
    // save record to db
    const newRecording = await prisma.conversation.create({
        data: {
            userId: userId,
            title: "hello", // todo: user input? ai generated
            recording_url: recordingUrl, // todo: to remove?
            file_path: filePath,
            transcript,
            summary: shortSummary ?? '',
            topics: {}, // todo: how to make [topic, topic] or []?
            duration: 60, // todo: to calculate duration
        }
        
    });
    
    return {
        ...newRecording,
        transcript,
        shortSummary,
        allTopics,
        allIntents
    };
};

export const getRecording = async(req: GetRequest) => {
    const {recordingId} = req;
    const id = recordingId;
    
    const conversation = await prisma.conversation.findUnique({
        where: { id: id },
        include: { topics: true }
    });
    if (conversation) {
        const file_path = conversation?.file_path;
        const recordingBlob = await downloadFile(BUCKET_NAME, file_path);
        return {
            ...conversation,
            recording: recordingBlob
        }
    }
    return conversation;
}

export const listRecordings = async(req: ListRequest) => {
    const { userId } = req;

    const conversationsInfo = await prisma.conversation.findMany({
        where: { userId: userId },
        select: {
            id: true,
            title: true,
            topics: true,
            createdAt: true,
            duration: true
        }
    });
    console.log(conversationsInfo);
    return conversationsInfo;
}

export const deleteRecording = async(req: DeleteRequest) => {
    const {recordingId} = req;
    // todo: delete file in storage as well
    const result = await prisma.conversation.delete({
        where: { id: recordingId},
    });
    console.log(result);
    return result;
}


export const updateRecording = async(req: UpdateRequest) => {
    const { recordingId, title, transcript} = req;
    const result = await prisma.conversation.update({
        where: { id: recordingId},
        data: {
            title: title,
            transcript: transcript
        },
    });
    console.log(result);
    return result;
}
