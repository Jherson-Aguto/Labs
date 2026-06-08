export interface LabProject {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  status: 'Live' | 'Active' | 'Prototype' | 'Archived' | string;
  stack: string[];
  liveUrl: string;
  githubUrl?: string;
  imageUrl?: string;
  featured: boolean;
  sortOrder: number;
  publishedAt: string;
  updatedAt: string;
  isPublished: boolean;
  detailedDescription?: string;
  problemStatement?: string;
  solutionOverview?: string;
  keyFeatures?: string[];
  demoUrl?: string;
}
