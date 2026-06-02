/**
 * ExerciseDB API Service
 * Fetches exercise data from self-hosted or public ExerciseDB instance
 */

export interface Exercise {
  id: string;
  name: string;
  target: string;
  equipment: string;
  bodyPart: string;
  gifUrl: string;
  instructions: string[];
}

// Configuration - update with your Railway URL
const EXERCISEDB_URL = process.env.EXPO_PUBLIC_EXERCISEDB_URL || 'https://exercisedb.p.rapidapi.com';
const EXERCISEDB_KEY = process.env.EXPO_PUBLIC_EXERCISEDB_KEY;

// Use public RapidAPI as fallback if no self-hosted URL configured
const isUsingRapidAPI = !process.env.EXPO_PUBLIC_EXERCISEDB_URL;

class ExerciseDBService {
  private cache: Map<string, Exercise> = new Map();
  private searchCache: Map<string, Exercise[]> = new Map();

  /**
   * Search exercises by name (fuzzy matching)
   */
  async searchByName(query: string): Promise<Exercise[]> {
    const cacheKey = `search_${query.toLowerCase()}`;
    
    // Check cache first
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey) || [];
    }

    try {
      const response = await this.fetchAPI('/exercises/name/' + encodeURIComponent(query));
      
      if (Array.isArray(response)) {
        this.searchCache.set(cacheKey, response);
        return response;
      }
      
      // Fallback: search all exercises locally (slower but works)
      const allExercises = await this.getAllExercises();
      const results = allExercises.filter(ex =>
        ex.name.toLowerCase().includes(query.toLowerCase())
      );
      
      this.searchCache.set(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Error searching exercises:', error);
      return [];
    }
  }

  /**
   * Get exercise by ID
   */
  async getById(id: string): Promise<Exercise | null> {
    // Check cache first
    if (this.cache.has(id)) {
      return this.cache.get(id) || null;
    }

    try {
      const response = await this.fetchAPI(`/exercises/id/${id}`);
      
      if (response && typeof response === 'object') {
        const exercise = response as Exercise;
        this.cache.set(id, exercise);
        return exercise;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching exercise:', error);
      return null;
    }
  }

  /**
   * Get exercise by name (exact match if possible)
   */
  async getByName(name: string): Promise<Exercise | null> {
    try {
      const results = await this.searchByName(name);
      
      if (results.length > 0) {
        // Prefer exact match
        const exact = results.find(
          ex => ex.name.toLowerCase() === name.toLowerCase()
        );
        return exact || results[0]; // Return first if no exact match
      }
      
      return null;
    } catch (error) {
      console.error('Error getting exercise by name:', error);
      return null;
    }
  }

  /**
   * Get exercises by target muscle group
   */
  async getByTarget(target: string): Promise<Exercise[]> {
    try {
      return await this.fetchAPI(`/exercises/target/${encodeURIComponent(target)}`);
    } catch (error) {
      console.error('Error fetching exercises by target:', error);
      return [];
    }
  }

  /**
   * Get exercises by equipment
   */
  async getByEquipment(equipment: string): Promise<Exercise[]> {
    try {
      return await this.fetchAPI(`/exercises/equipment/${encodeURIComponent(equipment)}`);
    } catch (error) {
      console.error('Error fetching exercises by equipment:', error);
      return [];
    }
  }

  /**
   * Get exercises by body part
   */
  async getByBodyPart(bodyPart: string): Promise<Exercise[]> {
    try {
      return await this.fetchAPI(`/exercises/bodyPart/${encodeURIComponent(bodyPart)}`);
    } catch (error) {
      console.error('Error fetching exercises by body part:', error);
      return [];
    }
  }

  /**
   * Get all exercises (cached after first call)
   */
  private allExercisesCache: Exercise[] | null = null;
  async getAllExercises(): Promise<Exercise[]> {
    if (this.allExercisesCache) {
      return this.allExercisesCache;
    }

    try {
      const exercises = await this.fetchAPI('/exercises');
      if (Array.isArray(exercises)) {
        this.allExercisesCache = exercises;
        return exercises;
      }
      return [];
    } catch (error) {
      console.error('Error fetching all exercises:', error);
      return [];
    }
  }

  /**
   * Internal API fetch with proper headers
   */
  private async fetchAPI(endpoint: string): Promise<any> {
    const url = `${EXERCISEDB_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add RapidAPI headers if using public API
    if (isUsingRapidAPI && EXERCISEDB_KEY) {
      headers['X-RapidAPI-Key'] = EXERCISEDB_KEY;
      headers['X-RapidAPI-Host'] = 'exercisedb.p.rapidapi.com';
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`ExerciseDB API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Clear caches (useful for refresh)
   */
  clearCache(): void {
    this.cache.clear();
    this.searchCache.clear();
    this.allExercisesCache = null;
  }

  /**
   * Get exercise recommendations based on AI-detected exercise name
   * Matches AI output to ExerciseDB catalog
   */
  async matchExerciseName(aiDetectedName: string): Promise<Exercise | null> {
    // First try exact match
    let exercise = await this.getByName(aiDetectedName);
    if (exercise) return exercise;

    // Try fuzzy matching
    const allExercises = await this.getAllExercises();
    const lowerAI = aiDetectedName.toLowerCase();

    // Prefer exercises that contain all words from AI detection
    const words = lowerAI.split(' ').filter(w => w.length > 2);
    const scored = allExercises
      .map(ex => ({
        exercise: ex,
        score: words.filter(w => ex.name.toLowerCase().includes(w)).length,
      }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored[0]?.exercise || null;
  }
}

export const exerciseDB = new ExerciseDBService();
