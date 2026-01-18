/**
 * VetPath API Service
 * Handles all communication with the backend
 */

const API_BASE = '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: `HTTP ${response.status}: ${response.statusText}`
      }));
      throw new Error(error.detail || 'An error occurred');
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Parse military experience into structured skills
 */
export async function parseExperience(experience) {
  return fetchApi('/parse', {
    method: 'POST',
    body: JSON.stringify({ experience }),
  });
}

/**
 * Match skills to civilian careers
 */
export async function matchCareers(skills, preferences = null) {
  return fetchApi('/match', {
    method: 'POST',
    body: JSON.stringify({ skills, preferences }),
  });
}

/**
 * Match careers from a complete military profile
 */
export async function matchFromProfile(profile) {
  return fetchApi('/match/profile', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
}

/**
 * Get career matches for a specific MOS code
 */
export async function matchFromMOS(mosCode, branch = null) {
  const params = branch ? `?branch=${encodeURIComponent(branch)}` : '';
  return fetchApi(`/match/mos/${encodeURIComponent(mosCode)}${params}`);
}

/**
 * Get detailed information about a career
 */
export async function getCareerDetails(occupationCode) {
  return fetchApi(`/career/${encodeURIComponent(occupationCode)}`);
}

/**
 * Generate a resume
 */
export async function generateResume(profile, parsedSkills, targetJob, targetCompany = null) {
  return fetchApi('/resume', {
    method: 'POST',
    body: JSON.stringify({
      profile,
      parsed_skills: parsedSkills,
      target_job: targetJob,
      target_company: targetCompany,
    }),
  });
}

/**
 * Analyze skills gaps
 */
export async function analyzeGaps(veteranSkills, targetOccupationCode) {
  return fetchApi('/gaps', {
    method: 'POST',
    body: JSON.stringify({
      veteran_skills: veteranSkills,
      target_occupation_code: targetOccupationCode,
    }),
  });
}

/**
 * Get career readiness score
 */
export async function getReadinessScore(occupationCode, skills) {
  const skillsParam = skills.join(',');
  return fetchApi(`/gaps/readiness/${encodeURIComponent(occupationCode)}?skills=${encodeURIComponent(skillsParam)}`);
}

/**
 * Get quick-win training recommendations
 */
export async function getQuickWins(occupationCode, skills) {
  const skillsParam = skills.join(',');
  return fetchApi(`/gaps/quick-wins/${encodeURIComponent(occupationCode)}?skills=${encodeURIComponent(skillsParam)}`);
}

/**
 * List available occupations
 */
export async function listOccupations(industry = null, limit = 20) {
  const params = new URLSearchParams();
  if (industry) params.append('industry', industry);
  params.append('limit', limit.toString());
  return fetchApi(`/occupations?${params}`);
}

/**
 * List available industries
 */
export async function listIndustries() {
  return fetchApi('/industries');
}

/**
 * List available MOS codes
 */
export async function listMOSCodes(branch = null) {
  const params = branch ? `?branch=${encodeURIComponent(branch)}` : '';
  return fetchApi(`/mos-codes${params}`);
}

/**
 * Health check
 */
export async function healthCheck() {
  return fetchApi('/health');
}
