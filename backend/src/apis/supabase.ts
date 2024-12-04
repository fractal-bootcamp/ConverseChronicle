import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-public-api-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// upload object to url
export const uploadObject = async (url : string) => {
    const file = "filename"
    const { data, error } = await supabase
        .storage
        .from('your-bucket-name')
        .upload('path/to/your-file.ext', file);

    if (error) {
        console.error('Error uploading file:', error.message);
    } else {
        console.log('File uploaded successfully:', data);
    }
}

// created sign url for frontend to upload .wav file
export const generatePresignedUrl = async () => {
    const { data, error } = await supabase
        .storage
        .from('your-bucket-name')
        .createSignedUploadUrl('path/to/your-file.ext');

    if (error) {
    console.error('Error creating signed upload URL:', error.message);
    return;
    }

    const { signedUrl, token } = data;
}