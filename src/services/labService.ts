import type { LabProject } from '../types/lab';

const API_URL = import.meta.env.VITE_LABS_API_URL || '/api/labs/projects';

/**
 * Fetches lab projects strictly from the dynamic API registry.
 */
export async function getLabProjects(): Promise<LabProject[]> {
  const response = await fetch(API_URL, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch lab projects: ${response.status}`);
  }

  const rawProjects: any[] = await response.json();
  
  const projects: LabProject[] = rawProjects.map((proj: any) => ({
    id: proj.id.toString(),
    slug: proj.slug,
    name: proj.title,
    description: proj.shortDescription,
    category: proj.category,
    status: proj.status,
    stack: proj.techStack || [],
    liveUrl: proj.liveUrl || "",
    githubUrl: proj.repositoryUrl || "",
    imageUrl: proj.imageUrl || undefined,
    featured: proj.featured || false,
    sortOrder: proj.sortOrder ?? 0,
    publishedAt: proj.publishedAt,
    updatedAt: proj.updatedAt,
    isPublished: true, // The API registry endpoint only serves published builds
  }));

  return projects
    .sort((a, b) => {
      // Primary sort: sortOrder (lower value = higher priority)
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      // Secondary sort: updatedAt or publishedAt descending
      const dateA = new Date(a.updatedAt || a.publishedAt).getTime();
      const dateB = new Date(b.updatedAt || b.publishedAt).getTime();
      return dateB - dateA;
    });
}
