const path = require('path');
const { execFile } = require('child_process');
const childService = require('./childService');

class AIService {
  /**
   * AI Needs Analysis Entry Point
   * Accepts childId, fetches profile from DB, anonymizes payload, runs AI agent,
   * validates response, deduplicates with existing needs, updates DB, and returns standardized response.
   */
  async analyzeChildNeeds(childId) {
    if (!childId) {
      throw new Error('Child ID is required for AI Needs Analysis.');
    }

    const child = await childService.getChildById(childId);
    if (!child) {
      const error = new Error('Child profile not found.');
      error.statusCode = 404;
      throw error;
    }

    // Extract ONLY non-sensitive anonymized attributes for AI analysis
    const anonymizedPayload = {
      age: child.age,
      gender: child.gender,
      educationLevel: child.educationLevel || '',
      interests: child.interests || [],
      skills: child.skills || [],
      aspirations: child.aspirations || [],
      existingNeeds: (child.needs || []).map(n => ({
        category: n.category,
        description: n.description,
        urgency: n.urgency
      }))
    };

    // Execute Python AI Agent / Node.js Engine
    const aiRawResult = await this._executeNeedsAnalysisAgent(anonymizedPayload);

    // Validate AI Output
    const validatedNeeds = this._validateNeedsOutput(aiRawResult);

    // Intelligent Merge & Deduplication Strategy:
    // Retain all existing needs (preserving manual entries), append new non-duplicate AI needs.
    const existingNeeds = child.needs || [];
    const mergedNeeds = [...existingNeeds];

    for (const newNeed of validatedNeeds) {
      const isDuplicate = existingNeeds.some(existing => {
        const catMatch = existing.category.toLowerCase() === newNeed.category.toLowerCase();
        const descMatch = existing.description.toLowerCase().includes(newNeed.description.toLowerCase()) ||
                          newNeed.description.toLowerCase().includes(existing.description.toLowerCase());
        return catMatch && descMatch;
      });

      if (!isDuplicate) {
        mergedNeeds.push({
          category: newNeed.category,
          description: newNeed.description,
          urgency: newNeed.urgency,
          reason: newNeed.reason
        });
      }
    }

    // Persist updated needs array to MongoDB
    await childService.updateChild(childId, { needs: mergedNeeds });

    return {
      success: true,
      data: {
        childId,
        needs: mergedNeeds
      }
    };
  }

  /**
   * Internal agent execution runner. Attempts Python agent execution first,
   * falling back smoothly to JS agent engine.
   */
  async _executeNeedsAnalysisAgent(anonymizedPayload) {
    return new Promise((resolve) => {
      const pythonScript = path.resolve(__dirname, '../../../ai/agents/needs_analysis_agent/service.py');
      const payloadStr = JSON.stringify(anonymizedPayload);

      execFile('python', [pythonScript, payloadStr], { timeout: 8000 }, (error, stdout, stderr) => {
        if (!error && stdout) {
          try {
            const parsed = JSON.parse(stdout.trim());
            if (parsed && parsed.needs) {
              return resolve(parsed);
            }
          } catch (e) {
            // JSON parse fallback
          }
        }
        // Fallback to JS AI Engine if Python is unavailable or fails
        resolve(this._jsFallbackNeedsEngine(anonymizedPayload));
      });
    });
  }

  /**
   * Fallback JS Rule Engine for zero-dependency / offline execution
   */
  _jsFallbackNeedsEngine(payload) {
    const needs = [];
    const interests = (payload.interests || []).map(i => i.toLowerCase());
    const aspirations = (payload.aspirations || []).map(a => a.toLowerCase());
    const age = payload.age || 10;

    if (interests.some(t => ['coding', 'programming', 'tech', 'software', 'computer'].includes(t)) ||
        aspirations.some(t => ['software engineer', 'programmer', 'developer', 'tech'].includes(t))) {
      needs.push({
        category: 'Education',
        description: 'Programming & Technology Mentorship',
        urgency: 'High',
        reason: 'The child shows an active interest or career aspiration in software engineering and technology.'
      });
      needs.push({
        category: 'Other',
        description: 'Access to a Computer & Coding Tools',
        urgency: 'Medium',
        reason: 'Hands-on computer access is required to support the child\'s technology learning goals.'
      });
    }

    if (interests.some(t => ['science', 'math', 'medicine', 'engineering'].includes(t)) ||
        aspirations.some(t => ['doctor', 'engineer', 'scientist'].includes(t))) {
      needs.push({
        category: 'Education',
        description: 'STEM Academic Tutoring & Learning Materials',
        urgency: 'High',
        reason: 'STEM subject tutoring will help the child build foundational academic skills for their career goals.'
      });
    }

    if (age < 14) {
      needs.push({
        category: 'Healthcare',
        description: 'Routine Pediatric Health & Dental Assessment',
        urgency: 'Medium',
        reason: 'Regular preventive healthcare checks support healthy developmental milestones.'
      });
    }

    if (needs.length === 0) {
      needs.push({
        category: 'Mentorship',
        description: 'General Academic & Life Skills Mentorship',
        urgency: 'Medium',
        reason: 'Personal guidance helps vulnerable youth navigate education and skill development.'
      });
    }

    return { needs };
  }

  /**
   * Validates AI response structure against schema expectations.
   */
  _validateNeedsOutput(aiOutput) {
    if (!aiOutput || !Array.isArray(aiOutput.needs)) {
      throw new Error('Invalid AI response: Expected a JSON object containing a "needs" array.');
    }

    const validCategories = ['Education', 'Healthcare', 'Mentorship', 'Nutrition', 'Other'];
    const validUrgencies = ['Low', 'Medium', 'High', 'Critical'];

    return aiOutput.needs.map((item, index) => {
      if (!item.description || typeof item.description !== 'string') {
        throw new Error(`Invalid AI need item at index ${index}: missing description.`);
      }

      // Category normalization & validation
      let cat = item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1).toLowerCase() : 'Other';
      if (!validCategories.includes(cat)) cat = 'Other';

      // Urgency normalization & validation
      let urg = item.urgency ? item.urgency.charAt(0).toUpperCase() + item.urgency.slice(1).toLowerCase() : 'Medium';
      if (!validUrgencies.includes(urg)) urg = 'Medium';

      const reason = item.reason || `Identified ${cat} support requirement based on child profile.`;

      return {
        category: cat,
        description: item.description.trim(),
        urgency: urg,
        reason: reason.trim()
      };
    });
  }

  async runMatching(childId) {
    return {
      childId,
      recommendedMatches: [],
      score: 0.89,
      explanation: 'AI Matching skeleton algorithm executed successfully.'
    };
  }

  async generateDevelopmentPlan(childId) {
    return {
      childId,
      goals: ['Milestone 1: Quarterly Academic Assessment'],
      status: 'skeleton_plan'
    };
  }
}

module.exports = new AIService();
