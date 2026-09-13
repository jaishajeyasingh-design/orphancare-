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

  /**
   * AI Hybrid Matching Engine Entry Point
   * Calculates multi-factor alignment score between a child profile and all open opportunities,
   * generates concise AI justifications for top-ranked matches, and persists Match records (status: Pending_Admin_Review).
   */
  async runMatching(childId) {
    if (!childId) {
      throw new Error('Child ID is required for AI Matching.');
    }

    const child = await childService.getChildById(childId);
    if (!child) {
      const error = new Error('Child profile not found.');
      error.statusCode = 404;
      throw error;
    }

    const opportunityService = require('./opportunityService');
    const matchRepository = require('../repositories/matchRepository');

    // Retrieve open opportunities
    const openOpportunities = await opportunityService.getOpportunities({ status: 'Open' });
    if (!openOpportunities || openOpportunities.length === 0) {
      return {
        childId,
        recommendedMatches: [],
        message: 'No open opportunities currently available for matching.'
      };
    }

    const rankedCandidates = [];

    // Evaluate deterministic score for each open opportunity
    for (const opp of openOpportunities) {
      const scoreResult = this._calculateHybridMatchScore(child, opp);
      if (scoreResult.eligible && scoreResult.totalScore >= 0.15) {
        rankedCandidates.push({
          opportunity: opp,
          score: scoreResult.totalScore,
          breakdown: scoreResult.breakdown
        });
      }
    }

    // Rank opportunities descending by score
    rankedCandidates.sort((a, b) => b.score - a.score);

    const generatedMatches = [];

    // Process top matches (limit to top 5 recommendations)
    const topCandidates = rankedCandidates.slice(0, 5);

    for (const candidate of topCandidates) {
      const opp = candidate.opportunity;

      // Synthesize AI explanation justification
      const explanationResult = await this._executeMatchingAgent({
        child: {
          age: child.age,
          educationLevel: child.educationLevel,
          interests: child.interests || [],
          skills: child.skills || [],
          aspirations: child.aspirations || [],
          needs: child.needs || []
        },
        opportunity: {
          title: opp.title,
          type: opp.type,
          description: opp.description,
          supportCategories: opp.supportCategories || [],
          requiredSkills: opp.requiredSkills || [],
          targetInterests: opp.targetInterests || [],
          eligibility: opp.eligibility || {}
        },
        score_breakdown: candidate.breakdown
      });

      const matchReason = explanationResult.explanation || `Matched based on alignment in ${opp.type} support.`;

      // Check if pending match already exists for this child & opportunity
      let existingMatch = await matchRepository.findByChildAndOpportunity(child._id, opp._id);

      let savedMatch;
      if (existingMatch) {
        savedMatch = await matchRepository.update(existingMatch._id, {
          aiConfidenceScore: candidate.score,
          aiRecommendationReason: matchReason,
          status: 'Pending_Admin_Review'
        });
      } else {
        savedMatch = await matchRepository.create({
          child: child._id,
          opportunity: opp._id,
          sponsor: opp.sponsor ? (opp.sponsor._id || opp.sponsor) : null,
          aiConfidenceScore: candidate.score,
          aiRecommendationReason: matchReason,
          status: 'Pending_Admin_Review'
        });
      }

      generatedMatches.push(savedMatch);
    }

    return {
      success: true,
      childId,
      recommendedMatches: generatedMatches
    };
  }

  /**
   * Deterministic Multi-Factor Hybrid Matching Engine
   * Need Alignment (35%), Skill (25%), Interest (20%), Aspiration (15%), Eligibility (5%)
   */
  _calculateHybridMatchScore(child, opp) {
    const age = child.age || 0;
    const minAge = opp.eligibility?.minAge;
    const maxAge = opp.eligibility?.maxAge;

    // Hard Eligibility Filtering
    if (minAge !== undefined && minAge !== null && age < minAge) return { eligible: false, totalScore: 0 };
    if (maxAge !== undefined && maxAge !== null && age > maxAge) return { eligible: false, totalScore: 0 };

    // 1. Need Alignment Score (35%)
    let needScore = 0;
    const childNeeds = child.needs || [];
    const oppType = (opp.type || '').toLowerCase();
    const oppCategories = (opp.supportCategories || []).map(c => c.toLowerCase());

    const urgencyMultipliers = { 'critical': 1.0, 'high': 0.85, 'medium': 0.65, 'low': 0.45 };

    // Category mapping logic
    const categoryMapping = {
      'education': ['scholarship', 'educational', 'education'],
      'healthcare': ['medical', 'healthcare'],
      'mentorship': ['mentorship'],
      'nutrition': ['medical', 'nutrition', 'other'],
      'other': ['equipment', 'other']
    };

    for (const need of childNeeds) {
      const needCat = (need.category || '').toLowerCase();
      const mappedOppTypes = categoryMapping[needCat] || [needCat];
      const mult = urgencyMultipliers[(need.urgency || '').toLowerCase()] || 0.65;

      const typeMatch = mappedOppTypes.includes(oppType) || oppCategories.some(c => mappedOppTypes.includes(c));
      const descMatch = need.description && (opp.title.toLowerCase().includes(need.description.toLowerCase()) || opp.description.toLowerCase().includes(need.description.toLowerCase()));

      if (typeMatch || descMatch) {
        const itemScore = (typeMatch ? 0.7 : 0) + (descMatch ? 0.3 : 0);
        needScore = Math.max(needScore, itemScore * mult);
      }
    }

    // 2. Skill Alignment Score (25%)
    let skillScore = 0.70; // default baseline if opportunity requires no specific skills
    const oppSkills = (opp.requiredSkills || []).map(s => s.toLowerCase());
    const childSkills = (child.skills || []).map(s => s.toLowerCase());

    if (oppSkills.length > 0) {
      const matchedSkills = oppSkills.filter(os => childSkills.some(cs => cs.includes(os) || os.includes(cs)));
      skillScore = matchedSkills.length / oppSkills.length;
    }

    // 3. Interest Alignment Score (20%)
    let interestScore = 0.70; // default baseline if opportunity specifies no target interests
    const oppInterests = (opp.targetInterests || []).map(i => i.toLowerCase());
    const childInterests = (child.interests || []).map(i => i.toLowerCase());

    if (oppInterests.length > 0) {
      const matchedInterests = oppInterests.filter(oi => childInterests.some(ci => ci.includes(oi) || oi.includes(ci)));
      interestScore = matchedInterests.length / oppInterests.length;
    }

    // 4. Aspiration Alignment Score (15%)
    let aspirationScore = 0;
    const childAspirations = (child.aspirations || []).map(a => a.toLowerCase());
    const oppText = `${opp.title} ${opp.description} ${(opp.targetInterests || []).join(' ')}`.toLowerCase();

    if (childAspirations.length > 0) {
      const matchedAspirations = childAspirations.filter(a => oppText.includes(a));
      aspirationScore = matchedAspirations.length / childAspirations.length;
    }

    // 5. Eligibility Fit Component (5%)
    const eligibilityScore = 1.0;

    // Total Weighted Score Calculation
    const totalScore = (needScore * 0.35) + (skillScore * 0.25) + (interestScore * 0.20) + (aspirationScore * 0.15) + (eligibilityScore * 0.05);
    const finalScore = Math.min(1.0, Math.round(totalScore * 100) / 100);

    return {
      eligible: true,
      totalScore: finalScore,
      breakdown: {
        needScore: Math.round(needScore * 100) / 100,
        skillScore: Math.round(skillScore * 100) / 100,
        interestScore: Math.round(interestScore * 100) / 100,
        aspirationScore: Math.round(aspirationScore * 100) / 100
      }
    };
  }

  /**
   * Internal runner for Matching Agent
   */
  async _executeMatchingAgent(candidateData) {
    return new Promise((resolve) => {
      const pythonScript = path.resolve(__dirname, '../../../ai/agents/matching_agent/service.py');
      const payloadStr = JSON.stringify(candidateData);

      execFile('python', [pythonScript, payloadStr], { timeout: 8000 }, (error, stdout, stderr) => {
        if (!error && stdout) {
          try {
            const parsed = JSON.parse(stdout.trim());
            if (parsed && parsed.explanation) {
              return resolve(parsed);
            }
          } catch (e) {
            // JSON parse fallback
          }
        }
        resolve(this._jsFallbackMatchingEngine(candidateData));
      });
    });
  }

  /**
   * Fallback JS Explanation Engine
   */
  _jsFallbackMatchingEngine(candidateData) {
    const opp = candidateData.opportunity || {};
    const child = candidateData.child || {};
    const oppTitle = opp.title || 'Opportunity';

    const childInterests = (child.interests || []).map(i => i.toLowerCase());
    const childSkills = (child.skills || []).map(s => s.toLowerCase());
    const childAspirations = (child.aspirations || []).map(a => a.toLowerCase());

    const oppInterests = (opp.targetInterests || []).map(i => i.toLowerCase());
    const oppSkills = (opp.requiredSkills || []).map(s => s.toLowerCase());

    const matchedParts = [];

    if (oppInterests.some(i => childInterests.includes(i))) {
      matchedParts.push("aligns with the child's interests");
    }
    if (oppSkills.some(s => childSkills.includes(s))) {
      matchedParts.push("matches the child's demonstrated skills");
    }
    if (childAspirations.some(a => oppTitle.toLowerCase().includes(a))) {
      matchedParts.push("supports future career aspirations");
    }

    if (matchedParts.length === 0) {
      matchedParts.push("directly addresses identified developmental support needs");
    }

    const explanation = `The '${oppTitle}' opportunity ${matchedParts.join(', ')}.`;
    return { explanation };
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
