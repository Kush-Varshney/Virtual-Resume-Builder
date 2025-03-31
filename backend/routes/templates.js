const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Template = require('../models/Template');

// @route   GET api/templates
// @desc    Get all templates
// @access  Public
router.get('/', async (req, res) => {
  try {
    const templates = await Template.find().sort({ name: 1 });
    res.json(templates);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/templates/:id
// @desc    Get template by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ msg: 'Template not found' });
    }
    
    res.json(template);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Template not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/templates
// @desc    Create a new template (admin only)
// @access  Private/Admin
router.post('/', auth, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(401).json({ msg: 'Not authorized as admin' });
  }
  
  const { name, description, previewImage, isPremium } = req.body;
  
  try {
    // Check if template already exists
    let template = await Template.findOne({ name });
    if (template) {
      return res.status(400).json({ msg: 'Template already exists' });
    }
    
    // Create new template
    template = new Template({
      name,
      description,
      previewImage,
      isPremium
    });
    
    await template.save();
    res.json(template);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/templates/:id
// @desc    Update a template (admin only)
// @access  Private/Admin
router.put('/:id', auth, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(401).json({ msg: 'Not authorized as admin' });
  }
  
  const { name, description, previewImage, isPremium } = req.body;
  
  try {
    let template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ msg: 'Template not found' });
    }
    
    // Update template
    template = await Template.findByIdAndUpdate(
      req.params.id,
      { $set: { name, description, previewImage, isPremium } },
      { new: true }
    );
    
    res.json(template);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Template not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/templates/:id
// @desc    Delete a template (admin only)
// @access  Private/Admin
router.delete('/:id', auth, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(401).json({ msg: 'Not authorized as admin' });
  }
  
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ msg: 'Template not found' });
    }
    
    await template.remove();
    res.json({ msg: 'Template removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Template not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;