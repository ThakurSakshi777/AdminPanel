import Task from '../models/Task.js';
import User from '../models/User.js';

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private (HR/TL)
export const getAllTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.query;
    
    let filter = {};
    
    // Filter by status
    if (status) {
      filter.status = status;
    }
    
    // Filter by priority
    if (priority) {
      filter.priority = priority;
    }
    
    // Filter by assigned employee
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }
    
    const tasks = await Task.find(filter)
      .sort({ dueDate: 1, priority: -1 })
      .limit(100);

    // Calculate statistics
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const onHoldTasks = tasks.filter(t => t.status === 'On Hold').length;
    const urgentTasks = tasks.filter(t => t.priority === 'Urgent').length;

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
      statistics: {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        onHold: onHoldTasks,
        urgent: urgentTasks,
      },
    });
  } catch (error) {
    console.error('Get All Tasks Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message,
    });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private (HR/TL)
export const createTask = async (req, res) => {
  try {
    const {
      taskTitle,
      description,
      assignedToEmployeeId,
      priority,
      dueDate,
      project,
    } = req.body;

    const assignedBy = req.user;

    // Validation
    if (!taskTitle || !description || !assignedToEmployeeId || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: taskTitle, description, assignedToEmployeeId, dueDate',
      });
    }

    // Find the employee to assign the task
    const assignedToUser = await User.findOne({ employeeId: assignedToEmployeeId });

    if (!assignedToUser) {
      return res.status(404).json({
        success: false,
        message: `Employee with ID ${assignedToEmployeeId} not found`,
      });
    }

    // Create task
    const task = await Task.create({
      taskTitle,
      description,
      assignedTo: assignedToUser._id,
      assignedToName: assignedToUser.name,
      assignedToEmployeeId: assignedToUser.employeeId,
      assignedBy: assignedBy._id,
      assignedByName: assignedBy.name,
      priority: priority || 'Medium',
      dueDate: new Date(dueDate),
      project: project || '',
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    console.error('Create Task Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message,
    });
  }
};

// @desc    Get my tasks
// @route   GET /api/tasks/my
// @access  Private (Employee)
export const getMyTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, priority } = req.query;

    let filter = { assignedTo: userId };

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by priority
    if (priority) {
      filter.priority = priority;
    }

    const tasks = await Task.find(filter).sort({ dueDate: 1, priority: -1 });

    // Calculate statistics
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const overdueTasks = tasks.filter(t => {
      return t.status !== 'Completed' && new Date(t.dueDate) < new Date();
    }).length;

    res.status(200).json({
      success: true,
      data: tasks,
      statistics: {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        overdue: overdueTasks,
      },
    });
  } catch (error) {
    console.error('Get My Tasks Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your tasks',
      error: error.message,
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (All authenticated users)
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, priority, dueDate } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Update fields if provided
    if (status) {
      task.status = status;
      if (status === 'Completed' && !task.completedDate) {
        task.completedDate = new Date();
      }
    }

    if (remarks !== undefined) {
      task.remarks = remarks;
    }

    if (priority) {
      task.priority = priority;
    }

    if (dueDate) {
      task.dueDate = new Date(dueDate);
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    console.error('Update Task Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message,
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (HR/TL)
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await Task.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('Delete Task Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message,
    });
  }
};
