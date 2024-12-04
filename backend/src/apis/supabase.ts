import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";

dotenv.config();

// created sign url for frontend to upload audio file
export const generatePresignedUrl = async (userId: string, filename: string): Promise<string> => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_API_KEY;
    const supabase = createClient(supabaseUrl!, supabaseKey!);
    const bucketName = "recordings";
    const { data, error } = await supabase
        .storage
        .from(bucketName)
        .createSignedUploadUrl(`${userId}/${filename}`);

    if (error) {
        console.error('Error creating signed upload URL:', error);
        throw error;
    }
    const { signedUrl, token } = data;
    return signedUrl;
}
