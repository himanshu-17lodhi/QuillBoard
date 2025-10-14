import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client with Database types
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-application-name': 'notion-clone',
    },
  },
})

// Helper function to get user session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const session = await getSession()
  return !!session
}

// Helper function for real-time subscriptions
export const subscribeToChanges = (
  table: keyof Database['public']['Tables'],
  filter: string = '',
  callback: (payload: any) => void
) => {
  return supabase
    .channel('table-db-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table as string,
        filter: filter,
      },
      callback
    )
    .subscribe()
}

// Helper function to upload files to Supabase Storage
export const uploadFile = async (
  bucket: string,
  filePath: string,
  file: File
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error
  return data
}

// Helper function to get public URL for a file
export const getPublicUrl = (bucket: string, filePath: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}

// Helper function to download files
export const downloadFile = async (bucket: string, filePath: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(filePath)

  if (error) throw error
  return data
}

// Helper function to delete files
export const deleteFile = async (bucket: string, filePath: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove([filePath])

  if (error) throw error
  return data
}

// Helper function for database operations with error handling
export const withErrorHandling = async <T>(
  operation: Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> => {
  try {
    const result = await operation
    return result
  } catch (error) {
    console.error('Database operation failed:', error)
    return { data: null, error }
  }
}

// Export Supabase types for use throughout the app
export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']