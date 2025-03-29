import { supabase } from "../config/MediaStorageClient";

export async function getNewSignedUrl(fileName: string) {
    const { data, error } = await supabase
      .storage
      .from('your-bucket')
      .createSignedUrl(fileName, 3600); // 1 hour expiration
  
    if (error) throw error;
    return data.signedUrl;
  }