import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";
import { BUCKET_NAME } from '../constant';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

// created sign url for frontend to upload audio file
export const generatePresignedUrl = async (bucketName: string=BUCKET_NAME, filePath: string): Promise<string> => {
    console.log('filePath', filePath);
    const { data, error } = await supabase
        .storage
        .from(bucketName)
        .createSignedUrl(filePath, 60*2) // valid for 2 minutes

    if (error) {
        console.error('Error creating signed upload URL:', error);
        throw error;
    }
    const { signedUrl } = data;
    return signedUrl;
}

// Function to upload a file buffer
export async function uploadBuffer(bucketName: string=BUCKET_NAME, filePath: string, buffer: Buffer, mimeType: string="audio/x-m4a") {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: mimeType,
      });
  
    if (error) {
      console.error('Error uploading buffer:', error);
      throw new Error('Error uploading recording to storage');
    }
  
    console.log('Buffer uploaded successfully:', data);
    return data;
  }

export async function downloadFile(bucketName=BUCKET_NAME, filePath: string ) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      console.error('Error downloading blob:', error);
      throw new Error('Error downloading recording from storage');
    }
    console.log('blob downloaded successfully:', data);
    return data;
}