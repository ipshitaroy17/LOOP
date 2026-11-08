import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
import type { Tutorial, PatternStep, MaterialItem } from './types';

type TutorialRow = Database['public']['Tables']['tutorials']['Row'];
type PatternStepRow = Database['public']['Tables']['pattern_steps']['Row'];

function mapStepRowToDomain(row: PatternStepRow): PatternStep {
  return {
    id: row.id,
    tutorialId: row.tutorial_id,
    stepNumber: row.step_number,
    stepIdentifier: row.step_identifier,
    title: row.title,
    instruction: row.instruction,
    stitchCount: row.stitch_count,
    abbreviations: row.abbreviations || [],
    notes: row.notes,
    videoTimestampSeconds: row.timestamp_verified ? row.video_timestamp_seconds : null,
    timestampVerified: row.timestamp_verified,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTutorialRowToDomain(row: TutorialRow, steps?: PatternStepRow[]): Tutorial {
  const parsedAbbreviations =
    typeof row.abbreviations === 'object' && row.abbreviations !== null && !Array.isArray(row.abbreviations)
      ? (row.abbreviations as Record<string, string>)
      : {};

  const parsedMaterials = Array.isArray(row.materials_details)
    ? (row.materials_details as unknown as MaterialItem[])
    : [];

  return {
    id: row.id,
    projectId: row.project_id,
    tutorialKey: row.tutorial_key || 'main',
    title: row.title,
    learningObjective: row.learning_objective,
    terminology: row.terminology,
    abbreviations: parsedAbbreviations,
    materialsDetails: parsedMaterials,
    patternSourceType: row.pattern_source_type,
    patternSourceTitle: row.pattern_source_title,
    patternSourceAuthor: row.pattern_source_author,
    patternSourceUrl: row.pattern_source_url,
    patternLicense: row.pattern_license,
    patternPermissionNotes: row.pattern_permission_notes,
    patternTested: row.pattern_tested,
    patternTestedNotes: row.pattern_tested_notes,
    videoUrl: row.video_url,
    videoCreatorName: row.video_creator_name,
    videoCreatorUrl: row.video_creator_url,
    videoEmbedAllowed: row.video_embed_allowed,
    reviewStatus: row.review_status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    steps: steps ? steps.map(mapStepRowToDomain) : undefined,
  };
}

/**
 * Fetch all verified and published tutorials for a given project ID.
 *
 * Strict Security & Review Guarantee:
 * Unverified, draft, or in-review tutorials will NOT be returned.
 * Only tutorials with review_status = 'verified_published' are retrieved.
 */
export async function getVerifiedTutorialsByProjectId(
  projectId: string
): Promise<Tutorial[]> {
  const supabase = await createClient();

  const { data: tutorials, error } = await supabase
    .from('tutorials')
    .select('*')
    .eq('project_id', projectId)
    .eq('review_status', 'verified_published')
    .order('created_at', { ascending: true });

  if (error) {
    console.error(`[tutorials] Error fetching tutorials for project ${projectId}:`, error.message);
    return [];
  }

  if (!tutorials || tutorials.length === 0) {
    return [];
  }

  return tutorials.map((t) => mapTutorialRowToDomain(t));
}

/**
 * Fetch all verified and published tutorials for a given project slug.
 */
export async function getVerifiedTutorialsByProjectSlug(
  slug: string
): Promise<Tutorial[]> {
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from('projects')
    .select('id')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error || !project) {
    return [];
  }

  return getVerifiedTutorialsByProjectId(project.id);
}

/**
 * Fetch a specific verified and published tutorial by project slug and tutorial key,
 * including its ordered pattern steps.
 */
export async function getVerifiedTutorial(
  projectSlug: string,
  tutorialKey: string
): Promise<Tutorial | null> {
  const supabase = await createClient();

  // Find project
  const { data: project, error: projError } = await supabase
    .from('projects')
    .select('id')
    .eq('slug', projectSlug)
    .eq('published', true)
    .maybeSingle();

  if (projError || !project) {
    return null;
  }

  // Find verified published tutorial with matching tutorial_key
  const { data: tutorial, error: tutError } = await supabase
    .from('tutorials')
    .select('*')
    .eq('project_id', project.id)
    .eq('tutorial_key', tutorialKey)
    .eq('review_status', 'verified_published')
    .maybeSingle();

  if (tutError || !tutorial) {
    return null;
  }

  // Load steps for this tutorial
  const { data: steps, error: stepsError } = await supabase
    .from('pattern_steps')
    .select('*')
    .eq('tutorial_id', tutorial.id)
    .order('step_number', { ascending: true });

  if (stepsError) {
    console.error(`[tutorials] Error fetching steps for tutorial ${tutorial.id}:`, stepsError.message);
  }

  return mapTutorialRowToDomain(tutorial, steps || []);
}

/**
 * Fetch the primary verified and published tutorial for a project ID (convenience helper).
 */
export async function getVerifiedTutorialByProjectId(
  projectId: string
): Promise<Tutorial | null> {
  const tutorials = await getVerifiedTutorialsByProjectId(projectId);
  return tutorials.length > 0 ? tutorials[0] : null;
}

/**
 * Fetch the primary verified and published tutorial by project slug (convenience helper).
 */
export async function getVerifiedTutorialByProjectSlug(
  slug: string
): Promise<Tutorial | null> {
  const tutorials = await getVerifiedTutorialsByProjectSlug(slug);
  return tutorials.length > 0 ? tutorials[0] : null;
}

