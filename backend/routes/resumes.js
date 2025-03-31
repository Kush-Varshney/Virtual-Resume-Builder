const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Resume = require('../models/Resume');
const Template = require('../models/Template');

// @route   GET api/resumes
// @desc    Get all resumes for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id })
      .populate('template', 'name previewImage')
      .sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/resumes/:id
// @desc    Get resume by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id).populate('template');
    
    // Check if resume exists
    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    
    // Check if user owns the resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(resume);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/resumes
// @desc    Create a new resume
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('template', 'Template is required').not().isEmpty(),
      check('personalInfo.fullName', 'Full name is required').not().isEmpty(),
      check('personalInfo.email', 'Email is required').isEmail()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if template exists
      const template = await Template.findById(req.body.template);
      if (!template) {
        return res.status(404).json({ msg: 'Template not found' });
      }

      // Create new resume
      const newResume = new Resume({
        user: req.user.id,
        template: req.body.template,
        name: req.body.name,
        personalInfo: req.body.personalInfo,
        summary: req.body.summary,
        education: req.body.education,
        experience: req.body.experience,
        skills: req.body.skills,
        certifications: req.body.certifications,
        languages: req.body.languages
      });

      const resume = await newResume.save();
      res.json(resume);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/resumes/:id
// @desc    Update a resume
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let resume = await Resume.findById(req.params.id);
    
    // Check if resume exists
    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    
    // Check if user owns the resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Update resume
    const {
      name,
      template,
      personalInfo,
      summary,
      education,
      experience,
      skills,
      certifications,
      languages
    } = req.body;
    
    const resumeFields = {};
    if (name) resumeFields.name = name;
    if (template) resumeFields.template = template;
    if (personalInfo) resumeFields.personalInfo = personalInfo;
    if (summary) resumeFields.summary = summary;
    if (education) resumeFields.education = education;
    if (experience) resumeFields.experience = experience;
    if (skills) resumeFields.skills = skills;
    if (certifications) resumeFields.certifications = certifications;
    if (languages) resumeFields.languages = languages;
    resumeFields.updatedAt = Date.now();
    
    resume = await Resume.findByIdAndUpdate(
      req.params.id,
      { $set: resumeFields },
      { new: true }
    );
    
    res.json(resume);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/resumes/:id
// @desc    Delete a resume
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    
    // Check if resume exists
    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    
    // Check if user owns the resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    await resume.remove();
    res.json({ msg: 'Resume removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;