import express from 'express';
import Alumni from '../models/Alumni.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const companyAliases = {
  google: ['google', 'google india', 'alphabet'],
  microsoft: ['microsoft', 'microsoft india'],
  amazon: ['amazon', 'amazon web services', 'aws'],
  flipkart: ['flipkart', 'flipkart internet'],
  razorpay: ['razorpay', 'razorpay software'],
  swiggy: ['swiggy', 'bundle technologies'],
  zoho: ['zoho', 'zoho corporation'],
  freshworks: ['freshworks', 'freshworks inc'],
  tcs: ['tcs', 'tata consultancy services', 'tata consulting services'],
  infosys: ['infosys'],
  wipro: ['wipro'],
  accenture: ['accenture'],
  cognizant: ['cognizant', 'cts', 'cognizant technology solutions'],
  ltiMindtree: ['lti mindtree', 'ltimindtree', 'larsen and toubro infotech', 'mindtree'],
  oracle: ['oracle', 'oracle india'],
  zomato: ['zomato', 'eternal limited'],
  paytm: ['paytm', 'one97 communications'],
  phonepe: ['phonepe', 'phone pe'],
  groww: ['groww', 'nextbillion technology'],
  cred: ['cred', 'dreamplug technologies'],
};

const normalizeCompany = (value = '') => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');
};

const acronymFromName = (value = '') => {
  const tokens = normalizeCompany(value)
    .split(' ')
    .filter(Boolean);
  return tokens.map((token) => token[0]).join('');
};

const getCanonicalKey = (value = '') => {
  const normalizedValue = normalizeCompany(value);

  for (const [key, aliases] of Object.entries(companyAliases)) {
    const normalizedAliases = aliases.map(normalizeCompany);
    if (normalizedAliases.includes(normalizedValue)) {
      return key;
    }

    if (acronymFromName(normalizedAliases[0]) === normalizedValue) {
      return key;
    }
  }

  return normalizedValue;
};

const isCompanyMatch = (inputCompany, candidateCompany) => {
  const normalizedInput = normalizeCompany(inputCompany);
  const normalizedCandidate = normalizeCompany(candidateCompany);

  if (!normalizedInput || !normalizedCandidate) {
    return false;
  }

  if (
    normalizedInput === normalizedCandidate ||
    normalizedCandidate.includes(normalizedInput) ||
    normalizedInput.includes(normalizedCandidate)
  ) {
    return true;
  }

  const inputKey = getCanonicalKey(normalizedInput);
  const candidateKey = getCanonicalKey(normalizedCandidate);
  return inputKey === candidateKey;
};

const mapAlumniResponse = (alumni) => ({
  name: alumni.name,
  batch: alumni.batch,
  role: alumni.role,
  linkedin: alumni.linkedin,
  email: alumni.email,
});

// @route   POST /api/alumni/company-match
// @desc    Find alumni currently working in a company
// @access  Private
router.post('/company-match', protect, async (req, res) => {
  try {
    const { company, alumniData } = req.body;

    if (!company || typeof company !== 'string' || !company.trim()) {
      return res.status(400).json({
        company: company || '',
        alumniFound: false,
        message: 'Company name is required.',
      });
    }

    const companyName = company.trim();
    let matchedAlumni = [];

    if (Array.isArray(alumniData)) {
      matchedAlumni = alumniData.filter((alumni) =>
        isCompanyMatch(companyName, alumni.currentCompany || '')
      );
    } else {
      const canonicalInput = getCanonicalKey(companyName);
      const aliasValues = companyAliases[canonicalInput] || [];
      const normalizedCandidates = [...new Set([
        normalizeCompany(companyName),
        ...aliasValues.map(normalizeCompany),
      ])];

      const indexedMatches = await Alumni.find({
        normalizedCompany: { $in: normalizedCandidates },
      }).lean();

      matchedAlumni = indexedMatches.filter((alumni) =>
        isCompanyMatch(companyName, alumni.currentCompany)
      );
    }

    if (!matchedAlumni.length) {
      return res.json({
        company: companyName,
        alumniFound: false,
        message: 'No alumni currently working in this company from the available dataset.',
      });
    }

    return res.json({
      company: companyName,
      alumniFound: true,
      totalMatches: matchedAlumni.length,
      alumni: matchedAlumni.map(mapAlumniResponse),
    });
  } catch (error) {
    return res.status(500).json({
      company: req.body?.company || '',
      alumniFound: false,
      message: error.message,
    });
  }
});

export default router;
