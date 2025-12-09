import Project from '../models/Project.js';
import User from '../models/User.js';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private (All authenticated users)
export const getAllProjects = async (req, res) => {
  try {
    const { status, priority, projectManager } = req.query;
    
    let filter = {};
    
    // Filter by status
    if (status) {
      filter.status = status;
    }
    
    // Filter by priority
    if (priority) {
      filter.priority = priority;
    }
    
    // Filter by project manager
    if (projectManager) {
      filter.projectManager = projectManager;
    }
    
    const projects = await Project.find(filter)
      .sort({ startDate: -1 })
      .limit(100);

    // Calculate statistics
    const totalProjects = projects.length;
    const planningProjects = projects.filter(p => p.status === 'Planning').length;
    const inProgressProjects = projects.filter(p => p.status === 'In Progress').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const onHoldProjects = projects.filter(p => p.status === 'On Hold').length;
    const avgProgress = projects.length > 0 
      ? (projects.reduce((sum, p) => sum + p.progress, 0) / projects.length).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
      statistics: {
        total: totalProjects,
        planning: planningProjects,
        inProgress: inProgressProjects,
        completed: completedProjects,
        onHold: onHoldProjects,
        averageProgress: avgProgress + '%',
      },
    });
  } catch (error) {
    console.error('Get All Projects Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message,
    });
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private (HR)
export const createProject = async (req, res) => {
  try {
    const {
      projectName,
      description,
      startDate,
      endDate,
      budget,
      projectManagerEmployeeId,
      teamMembers, // Array of { employeeId, role }
      priority,
    } = req.body;

    const createdBy = req.user;

    // Validation
    if (!projectName || !description || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: projectName, description, startDate, endDate',
      });
    }

    // Validate dates
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after or equal to start date',
      });
    }

    // Find project manager
    let projectManager = null;
    let projectManagerName = '';
    let projectManagerEmpId = '';

    if (projectManagerEmployeeId) {
      projectManager = await User.findOne({ employeeId: projectManagerEmployeeId });
      if (!projectManager) {
        return res.status(404).json({
          success: false,
          message: `Project Manager with ID ${projectManagerEmployeeId} not found`,
        });
      }
      projectManagerName = projectManager.name;
      projectManagerEmpId = projectManager.employeeId;
    }

    // Process team members
    let teamMembersData = [];
    if (teamMembers && Array.isArray(teamMembers)) {
      for (const member of teamMembers) {
        const user = await User.findOne({ employeeId: member.employeeId });
        if (user) {
          teamMembersData.push({
            userId: user._id,
            employeeId: user.employeeId,
            name: user.name,
            role: member.role || 'Team Member',
          });
        }
      }
    }

    // Create project
    const project = await Project.create({
      projectName,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      budget: budget || 0,
      projectManager: projectManager ? projectManager._id : null,
      projectManagerName,
      projectManagerEmployeeId: projectManagerEmpId,
      teamMembers: teamMembersData,
      priority: priority || 'Medium',
      createdBy: createdBy._id,
      createdByName: createdBy.name,
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  } catch (error) {
    console.error('Create Project Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message,
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (HR/Project Manager)
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      projectName,
      description,
      status,
      startDate,
      endDate,
      budget,
      priority,
      progress,
      remarks,
      teamMembers,
    } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Update fields if provided
    if (projectName) project.projectName = projectName;
    if (description) project.description = description;
    if (status) {
      project.status = status;
      if (status === 'Completed' && !project.completedDate) {
        project.completedDate = new Date();
        project.progress = 100;
      }
    }
    if (startDate) project.startDate = new Date(startDate);
    if (endDate) project.endDate = new Date(endDate);
    if (budget !== undefined) project.budget = budget;
    if (priority) project.priority = priority;
    if (progress !== undefined) project.progress = progress;
    if (remarks !== undefined) project.remarks = remarks;

    // Update team members if provided
    if (teamMembers && Array.isArray(teamMembers)) {
      let teamMembersData = [];
      for (const member of teamMembers) {
        const user = await User.findOne({ employeeId: member.employeeId });
        if (user) {
          teamMembersData.push({
            userId: user._id,
            employeeId: user.employeeId,
            name: user.name,
            role: member.role || 'Team Member',
          });
        }
      }
      project.teamMembers = teamMembersData;
    }

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    console.error('Update Project Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message,
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (HR)
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    await Project.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('Delete Project Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message,
    });
  }
};

// @desc    Get my assigned projects (for logged-in employee)
// @route   GET /api/projects/my
// @access  Private (Employee, TL, HR)
export const getMyProjects = async (req, res) => {
  try {
    console.log('📊 GET /api/projects/my - Fetching my projects...');
    console.log('👤 User:', req.user.email, 'ID:', req.user._id);

    // Get employee record to find employeeId
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const employeeId = user.employeeId;
    const userId = user._id;
    console.log('✅ Employee ID:', employeeId);
    console.log('✅ User ObjectId:', userId);

    // Find projects where user is project manager or team member
    // Use projectManagerEmployeeId (string) instead of projectManager (ObjectId)
    const projects = await Project.find({
      $or: [
        { projectManagerEmployeeId: employeeId },
        { projectManager: userId },
        { 'teamMembers.employeeId': employeeId },
        { 'teamMembers.userId': userId }
      ]
    }).sort({ startDate: -1 });

    console.log(`✅ Found ${projects.length} projects for employee ${employeeId}`);

    // Transform data for frontend
    const projectsData = projects.map(project => {
      // Check if user is project manager (compare with both employeeId and userId)
      const isProjectManager = 
        project.projectManagerEmployeeId === employeeId || 
        (project.projectManager && project.projectManager.toString() === userId.toString());
      
      // Find user's role in team
      const teamMember = project.teamMembers.find(tm => 
        tm.employeeId === employeeId || 
        (tm.userId && tm.userId.toString() === userId.toString())
      );
      const myRole = isProjectManager ? 'Project Manager' : (teamMember?.role || 'Team Member');
      
      return {
        id: project._id,
        projectId: project.projectId,
        name: project.projectName,
        description: project.description,
        status: project.status,
        progress: project.progress,
        priority: project.priority,
        startDate: project.startDate,
        endDate: project.endDate,
        budget: project.budget,
        actualCost: project.actualCost,
        projectManager: project.projectManager,
        teamSize: project.teamMembers?.length || 0,
        myRole: myRole,
        isProjectManager: isProjectManager,
        tasks: project.tasks || [],
        milestones: project.milestones || [],
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      };
    });

    // Calculate statistics
    const stats = {
      total: projectsData.length,
      planning: projectsData.filter(p => p.status === 'Planning').length,
      inProgress: projectsData.filter(p => p.status === 'In Progress').length,
      completed: projectsData.filter(p => p.status === 'Completed').length,
      onHold: projectsData.filter(p => p.status === 'On Hold').length,
      asManager: projectsData.filter(p => p.isProjectManager).length,
      asMember: projectsData.filter(p => !p.isProjectManager).length,
      avgProgress: projectsData.length > 0
        ? (projectsData.reduce((sum, p) => sum + p.progress, 0) / projectsData.length).toFixed(1)
        : 0,
    };

    res.status(200).json({
      success: true,
      count: projectsData.length,
      data: projectsData,
      statistics: stats,
    });
  } catch (error) {
    console.error('❌ Get My Projects Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching my projects',
      error: error.message,
    });
  }
};

// @desc    Update project progress (Employee)
// @route   PUT /api/projects/:id/progress
// @access  Private (Team Member)
export const updateProjectProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, remarks } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user is team member or project manager
    const isTeamMember = project.teamMembers.some(
      tm => tm.userId.toString() === userId.toString() || tm.employeeId === user.employeeId
    );
    const isProjectManager = project.projectManager && project.projectManager.toString() === userId.toString();

    if (!isTeamMember && !isProjectManager) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this project',
      });
    }

    // Validate progress
    if (progress !== undefined) {
      if (progress < 0 || progress > 100) {
        return res.status(400).json({
          success: false,
          message: 'Progress must be between 0 and 100',
        });
      }
      project.progress = progress;

      // Auto-update status based on progress
      if (progress === 0) {
        project.status = 'Planning';
      } else if (progress > 0 && progress < 100) {
        project.status = 'In Progress';
      } else if (progress === 100) {
        project.status = 'Completed';
        project.completedDate = new Date();
      }
    }

    if (remarks !== undefined) {
      project.remarks = remarks;
    }

    await project.save();

    console.log(`✅ Project progress updated by ${user.name} (${user.employeeId}): ${progress}%`);

    res.status(200).json({
      success: true,
      message: 'Project progress updated successfully',
      data: {
        id: project._id,
        projectName: project.projectName,
        progress: project.progress,
        status: project.status,
        remarks: project.remarks,
      },
    });
  } catch (error) {
    console.error('❌ Update Project Progress Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project progress',
      error: error.message,
    });
  }
};
