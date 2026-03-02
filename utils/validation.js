const Joi = require('joi');
const { AppError } = require('./errorHandler');

/**
 * Validation schemas
 */
const schemas = {
  // Auth
  signup: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(50).required(),
    role: Joi.string().valid('client', 'developer').default('developer'),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Developer Profile
  createDeveloperProfile: Joi.object({
    displayName: Joi.string().min(2).max(100).required(),
    bio: Joi.string().max(500),
    skills: Joi.array().items(Joi.string()),
    experienceLevel: Joi.string().valid('junior', 'mid', 'senior'),
    hourlyRate: Joi.number().min(0),
    availabilityStatus: Joi.string().valid('available', 'unavailable', 'busy'),
    portfolioLinks: Joi.array().items(Joi.string().uri()),
    location: Joi.string().max(100),
    isRemote: Joi.boolean(),
  }),

  updateDeveloperProfile: Joi.object({
    displayName: Joi.string().min(2).max(100),
    bio: Joi.string().max(500),
    skills: Joi.array().items(Joi.string()),
    experienceLevel: Joi.string().valid('junior', 'mid', 'senior'),
    hourlyRate: Joi.number().min(0),
    availabilityStatus: Joi.string().valid('available', 'unavailable', 'busy'),
    portfolioLinks: Joi.array().items(Joi.string().uri()),
    location: Joi.string().max(100),
    isRemote: Joi.boolean(),
    visibility: Joi.string().valid('public', 'hidden'),
  }).min(1),

  // Project
  createProject: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(2000),
    visibility: Joi.string().valid('private', 'team', 'public-read'),
    tags: Joi.array().items(Joi.string()),
    budget: Joi.number().min(0),
    deadline: Joi.date(),
  }),

  updateProject: Joi.object({
    title: Joi.string().min(3).max(200),
    description: Joi.string().max(2000),
    status: Joi.string().valid('active', 'paused', 'completed', 'archived'),
    visibility: Joi.string().valid('private', 'team', 'public-read'),
    tags: Joi.array().items(Joi.string()),
    budget: Joi.number().min(0),
    deadline: Joi.date(),
  }).min(1),

  // Task
  createTask: Joi.object({
    title: Joi.string().max(200).required(),
    description: Joi.string().max(1000),
    status: Joi.string().valid('todo', 'in-progress', 'blocked', 'done'),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical'),
    dueDate: Joi.date(),
  }),

  updateTask: Joi.object({
    title: Joi.string().max(200),
    description: Joi.string().max(1000),
    status: Joi.string().valid('todo', 'in-progress', 'blocked', 'done'),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical'),
    assignedTo: Joi.string().hex().length(24),
    dueDate: Joi.date(),
  }).min(1),

  // Message
  sendMessage: Joi.object({
    receiverId: Joi.string().hex().length(24).required(),
    content: Joi.string().max(5000).required(),
  }),

  sendProjectMessage: Joi.object({
    projectId: Joi.string().hex().length(24).required(),
    content: Joi.string().max(5000).required(),
  }),

  // Hire Request
  createHireRequest: Joi.object({
    developerId: Joi.string().hex().length(24).required(),
    title: Joi.string().max(200).required(),
    description: Joi.string().max(2000),
    budget: Joi.number().min(0),
    budget_type: Joi.string().valid('fixed', 'hourly'),
  }),

  // Review
  createReview: Joi.object({
    hireRequestId: Joi.string().hex().length(24).required(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(1000),
  }),

  // Report
  createReport: Joi.object({
    targetType: Joi.string().valid('user', 'project', 'message', 'review').required(),
    targetId: Joi.string().hex().length(24).required(),
    reason: Joi.string().valid('spam', 'abuse', 'inappropriate', 'fraud', 'other').required(),
    description: Joi.string().max(1000),
  }),
};

/**
 * Validation middleware factory
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((d) => d.message).join(', ');
    throw new AppError(messages, 400);
  }

  req.validated = value;
  next();
};

module.exports = {
  schemas,
  validate,
};
