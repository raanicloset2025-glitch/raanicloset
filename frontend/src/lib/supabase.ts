import { supabase, isSupabaseConfigured } from './supabaseClient';

export { supabase, isSupabaseConfigured };

export async function uploadMediaToSupabase(
  file: Blob | File,
  bucket: string,
  path: string,
  contentType?: string
): Promise<string> {
  const options: { upsert: boolean; contentType?: string } = { upsert: true };
  if (contentType) {
    options.contentType = contentType;
  } else if (file instanceof File && file.type) {
    options.contentType = file.type;
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, options);

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl.replace(/\s/g, '%20');
}
