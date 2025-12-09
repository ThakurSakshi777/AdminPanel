import DailyReport from '../models/DailyReport.js';

// @desc    Get my daily reports
// @route   GET /api/daily-reports/my
// @access  Private (Employee)
export const getMyReports = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    
    console.log('📊 Fetching daily reports for employee:', employeeId);

    const reports = await DailyReport.find({ employeeId })
      .sort({ date: -1 })
      .select('-__v');

    // Calculate statistics
    const totalReports = reports.length;
    const submittedCount = reports.filter(r => r.status === 'Submitted').length;
    const approvedCount = reports.filter(r => r.status === 'Approved').length;
    const rejectedCount = reports.filter(r => r.status === 'Rejected').length;
    const totalHoursWorked = reports.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
    const totalTasksCompleted = reports.reduce((sum, r) => sum + (r.tasksCompleted || 0), 0);

    console.log(`✅ Found ${totalReports} reports for ${employeeId}`);

    res.status(200).json({
      success: true,
      count: totalReports,
      data: reports,
      statistics: {
        totalReports,
        submittedCount,
        approvedCount,
        rejectedCount,
        totalHoursWorked,
        totalTasksCompleted,
        avgHoursPerReport: totalReports > 0 ? (totalHoursWorked / totalReports).toFixed(1) : 0,
      },
    });
  } catch (error) {
    console.error('❌ Get My Reports Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching daily reports',
      error: error.message,
    });
  }
};

// @desc    Create a new daily report
// @route   POST /api/daily-reports
// @access  Private (Employee)
export const createReport = async (req, res) => {
  try {
    const { title, description, tasksCompleted, hoursWorked, date } = req.body;
    const employeeId = req.user.employeeId;

    console.log('📝 Creating daily report for employee:', employeeId);

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
      });
    }

    // Create report
    const report = await DailyReport.create({
      employeeId,
      title,
      description,
      tasksCompleted: tasksCompleted || 0,
      hoursWorked: hoursWorked || 0,
      date: date ? new Date(date) : new Date(),
      status: 'Submitted',
    });

    console.log('✅ Daily report created:', report._id);

    res.status(201).json({
      success: true,
      message: 'Daily report created successfully',
      data: report,
    });
  } catch (error) {
    console.error('❌ Create Report Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating daily report',
      error: error.message,
    });
  }
};

// @desc    Update a daily report
// @route   PUT /api/daily-reports/:id
// @access  Private (Employee)
export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tasksCompleted, hoursWorked } = req.body;
    const employeeId = req.user.employeeId;

    console.log('📝 Updating daily report:', id);

    // Find report
    const report = await DailyReport.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    // Check ownership
    if (report.employeeId !== employeeId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report',
      });
    }

    // Check if report is already reviewed
    if (report.status === 'Approved' || report.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a reviewed report',
      });
    }

    // Update fields
    if (title) report.title = title;
    if (description) report.description = description;
    if (tasksCompleted !== undefined) report.tasksCompleted = tasksCompleted;
    if (hoursWorked !== undefined) report.hoursWorked = hoursWorked;

    await report.save();

    console.log('✅ Report updated:', report._id);

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: report,
    });
  } catch (error) {
    console.error('❌ Update Report Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating report',
      error: error.message,
    });
  }
};

// @desc    Delete a daily report
// @route   DELETE /api/daily-reports/:id
// @access  Private (Employee)
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user.employeeId;

    console.log('🗑️ Deleting daily report:', id);

    const report = await DailyReport.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    // Check ownership
    if (report.employeeId !== employeeId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report',
      });
    }

    // Check if report is already reviewed
    if (report.status === 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an approved report',
      });
    }

    await DailyReport.findByIdAndDelete(id);

    console.log('✅ Report deleted:', id);

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete Report Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting report',
      error: error.message,
    });
  }
};
