export interface CreateRequest {
  userId: string;
  recordingUrl?: string;
  recordingBody: Buffer;
}

export interface GetRequest {
  userId: string;
  recordingId: string;
}

export interface ListRequest { 
  userId: string;
}

export interface DeleteRequest {
  userId: string;
  recordingId: string;
}

export interface UpdateRequest {
  userId: string;
  recordingId: string;
  title: string;
  transcript: string;
}