import express from 'express';
import { Task } from '../models/Task';
import { auth } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all task routes
router.use(auth);

// Get all tasks for the authenticated user
router.get('/', async (req: any, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    return res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get a single task by ID
router.get('/:id', async (req: any, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Create a new task
router.post('/', async (req: any, res) => {
  try {
    const { title, description } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const task = new Task({
      title: title.trim(),
      description: description?.trim() || '',
      user: req.user._id
    });

    await task.save();
    return res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update a task
router.put('/:id', async (req: any, res) => {
  try {
    const { title, description, status } = req.body;
    const updateData: any = {};

    if (title !== undefined) {
      if (title.trim().length === 0) {
        return res.status(400).json({ message: 'Task title cannot be empty' });
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    if (status !== undefined) {
      if (!['pending', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      updateData.status = status;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', async (req: any, res) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Toggle task status
router.patch('/:id/toggle', async (req: any, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = task.status === 'pending' ? 'completed' : 'pending';
    await task.save();

    return res.json(task);
  } catch (error) {
    console.error('Toggle task error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
