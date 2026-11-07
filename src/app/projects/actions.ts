'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface ToggleSaveResult {
  success: boolean;
  isSaved?: boolean;
  error?: string;
  requiresAuth?: boolean;
}

/**
 * Toggles a project's saved status for the currently authenticated user.
 *
 * Safety & Data Integrity Rules:
 * 1. Requires verified server-side authentication; returns requiresAuth if unauthenticated.
 * 2. When saving:
 *    - If no record exists, inserts with status = 'saved'.
 *    - If a record already exists with status 'in_progress' or 'completed', does NOT overwrite it with 'saved'.
 * 3. When removing a save:
 *    - Only deletes the user_projects record if status = 'saved'.
 *    - Refuses to delete if status is 'in_progress' or 'completed' to safeguard active learning progress.
 * 4. Revalidates affected pages so the UI updates consistently across /explore, /my-projects, and /dashboard.
 */
export async function toggleSaveProjectAction(
  projectId: string,
  currentlySaved: boolean
): Promise<ToggleSaveResult> {
  if (!projectId) {
    return { success: false, error: 'Project ID is required.' };
  }

  const supabase = await createClient();

  // 1. Verify authenticated user identity
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return {
      success: false,
      requiresAuth: true,
      error: 'You must be signed in to save projects.',
    };
  }

  try {
    // 2. Check for an existing relationship in public.user_projects
    const { data: existing, error: fetchError } = await supabase
      .from('user_projects')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .maybeSingle();

    if (fetchError) {
      console.error('[toggleSaveProjectAction] Query error:', fetchError.message);
      return {
        success: false,
        error: 'Unable to check saved status. Please try again.',
      };
    }

    if (currentlySaved) {
      // User wants to UN-SAVE / REMOVE
      if (!existing) {
        // Already not saved
        return { success: true, isSaved: false };
      }

      // Safeguard: Never delete progress records (in_progress or completed)
      if (existing.status !== 'saved') {
        return {
          success: false,
          isSaved: true,
          error:
            'This project has active learning progress or has been completed. It cannot be removed from your projects.',
        };
      }

      // Delete the saved record
      const { error: deleteError } = await supabase
        .from('user_projects')
        .delete()
        .eq('id', existing.id)
        .eq('user_id', user.id)
        .eq('status', 'saved');

      if (deleteError) {
        console.error('[toggleSaveProjectAction] Delete error:', deleteError.message);
        return {
          success: false,
          isSaved: true,
          error: 'Could not remove project. Please try again.',
        };
      }

      revalidatePath('/my-projects');
      revalidatePath('/explore');
      revalidatePath('/dashboard');
      return { success: true, isSaved: false };
    } else {
      // User wants to SAVE
      if (existing) {
        // Record already exists; do not overwrite in_progress or completed with saved
        return { success: true, isSaved: true };
      }

      // Insert new saved relationship
      const { error: insertError } = await supabase
        .from('user_projects')
        .insert({
          user_id: user.id,
          project_id: projectId,
          status: 'saved',
        });

      if (insertError) {
        console.error('[toggleSaveProjectAction] Insert error:', insertError.message);
        return {
          success: false,
          isSaved: false,
          error: 'Could not save project. Please try again.',
        };
      }

      revalidatePath('/my-projects');
      revalidatePath('/explore');
      revalidatePath('/dashboard');
      return { success: true, isSaved: true };
    }
  } catch (err) {
    console.error('[toggleSaveProjectAction] Unexpected error:', err);
    return {
      success: false,
      error: 'A network error occurred while updating your saved projects.',
    };
  }
}

/**
 * Explicit action to remove a project from My Projects.
 */
export async function removeSavedProjectAction(projectId: string): Promise<ToggleSaveResult> {
  return await toggleSaveProjectAction(projectId, true);
}

