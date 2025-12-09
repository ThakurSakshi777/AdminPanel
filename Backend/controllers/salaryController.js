import Salary from '../models/Salary.js';
import Payslip from '../models/Payslip.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Notification from '../models/Notification.js';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';

// @desc    Get all salaries
// @route   GET /api/salary
// @access  Private (HR)
export const getAllSalaries = async (req, res) => {
  try {
    const { isActive, employeeId } = req.query;
    
    let filter = {};
    
    // Filter by active status
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    // Filter by employee ID
    if (employeeId) {
      filter.employeeId = employeeId;
    }
    
    const salaries = await Salary.find(filter).sort({ effectiveFrom: -1 });

    // Calculate statistics
    const totalSalaries = salaries.length;
    const activeSalaries = salaries.filter(s => s.isActive).length;
    const totalPayroll = salaries
      .filter(s => s.isActive)
      .reduce((sum, s) => sum + s.netSalary, 0);

    res.status(200).json({
      success: true,
      count: salaries.length,
      data: salaries,
      statistics: {
        total: totalSalaries,
        active: activeSalaries,
        totalMonthlyPayroll: totalPayroll,
      },
    });
  } catch (error) {
    console.error('Get All Salaries Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching salaries',
      error: error.message,
    });
  }
};

// @desc    Set employee salary
// @route   POST /api/salary
// @access  Private (HR)
export const setSalary = async (req, res) => {
  try {
    const {
      userId,
      employeeId,
      basicSalary,
      allowances,
      deductions,
      effectiveFrom,
      remarks,
    } = req.body;

    const createdBy = req.user;

    console.log('💰 setSalary called with:', { userId, employeeId, basicSalary });

    // Validation
    if (!basicSalary) {
      return res.status(400).json({
        success: false,
        message: 'Please provide basicSalary',
      });
    }

    if (!userId && !employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either userId or employeeId',
      });
    }

    // Find employee by userId or employeeId
    let employee;
    if (userId) {
      employee = await User.findById(userId);
    } else if (employeeId) {
      employee = await User.findOne({ employeeId });
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee not found`,
      });
    }

    console.log('✅ Found employee:', employee.name, employee._id);

    // Deactivate previous salary records
    await Salary.updateMany(
      { userId: employee._id, isActive: true },
      { isActive: false }
    );

    // Create new salary
    const salary = await Salary.create({
      userId: employee._id,
      employeeId: employee.employeeId,
      employeeName: employee.name,
      basicSalary,
      allowances: allowances || {},
      deductions: deductions || {},
      effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
      isActive: true,
      createdBy: createdBy._id,
      createdByName: createdBy.name,
      remarks: remarks || '',
    });

    res.status(201).json({
      success: true,
      message: 'Salary set successfully',
      data: salary,
    });
  } catch (error) {
    console.error('Set Salary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting salary',
      error: error.message,
    });
  }
};

// @desc    Update salary
// @route   PUT /api/salary/:id
// @access  Private (HR)
export const updateSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      basicSalary,
      allowances,
      deductions,
      effectiveFrom,
      isActive,
      remarks,
    } = req.body;

    const salary = await Salary.findById(id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary record not found',
      });
    }

    // Update fields if provided
    if (basicSalary !== undefined) salary.basicSalary = basicSalary;
    if (allowances) salary.allowances = { ...salary.allowances, ...allowances };
    if (deductions) salary.deductions = { ...salary.deductions, ...deductions };
    if (effectiveFrom) salary.effectiveFrom = new Date(effectiveFrom);
    if (isActive !== undefined) salary.isActive = isActive;
    if (remarks !== undefined) salary.remarks = remarks;

    await salary.save();

    res.status(200).json({
      success: true,
      message: 'Salary updated successfully',
      data: salary,
    });
  } catch (error) {
    console.error('Update Salary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating salary',
      error: error.message,
    });
  }
};

// @desc    Get payslip
// @route   GET /api/payslip/:id
// @access  Private (Employee - own, HR - all)
export const getPayslip = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const payslip = await Payslip.findById(id);

    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found',
      });
    }

    // Check access: Employee can only view own payslip
    if (user.role === 'employee' && payslip.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own payslip',
      });
    }

    res.status(200).json({
      success: true,
      data: payslip,
    });
  } catch (error) {
    console.error('Get Payslip Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payslip',
      error: error.message,
    });
  }
};

// @desc    Generate payslips for a month
// @route   POST /api/payslip/generate
// @access  Private (HR)
export const generatePayslips = async (req, res) => {
  try {
    const { month, year, employeeIds } = req.body;
    const generatedBy = req.user;

    // Validation
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month and year',
      });
    }

    // Get salaries for selected employees or all active salaries
    let salaries;
    if (employeeIds && employeeIds.length > 0) {
      salaries = await Salary.find({ 
        userId: { $in: employeeIds },
        isActive: true 
      });
    } else {
      salaries = await Salary.find({ isActive: true });
    }

    if (salaries.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No employees with active salaries found. Please set salary for employees first.',
        data: [],
        errors: employeeIds && employeeIds.length > 0 ? ['Selected employees do not have active salary records'] : ['No employees have active salary records']
      });
    }

    // Calculate working days in month
    const daysInMonth = new Date(year, month, 0).getDate();

    const generatedPayslips = [];
    const errors = [];

    for (const salary of salaries) {
      try {
        // Check if payslip already exists
        const existingPayslip = await Payslip.findOne({
          userId: salary.userId,
          month,
          year,
        });

        if (existingPayslip) {
          errors.push({
            employeeId: salary.employeeId,
            message: 'Payslip already exists for this month',
          });
          continue;
        }

        // Get attendance for the month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const attendanceRecords = await Attendance.find({
          userId: salary.userId,
          date: { $gte: startDate, $lte: endDate },
        });

        const presentDays = attendanceRecords.filter(
          a => a.status === 'Present' || a.status === 'Late'
        ).length;

        const halfDays = attendanceRecords.filter(
          a => a.status === 'Half Day'
        ).length;

        // Get approved leaves
        const approvedLeaves = await Leave.find({
          userId: salary.userId,
          status: 'Approved',
          startDate: { $lte: endDate },
          endDate: { $gte: startDate },
        });

        const leaveDays = approvedLeaves.reduce((sum, leave) => sum + leave.totalDays, 0);

        // Calculate paid days (present + (half days * 0.5) + approved leaves)
        const paidDays = Math.min(presentDays + (halfDays * 0.5) + leaveDays, daysInMonth);

        // Calculate pro-rated salary
        const perDaySalary = salary.netSalary / daysInMonth;
        const finalSalary = Math.round(perDaySalary * paidDays);

        // Fetch employee details
        const employee = await Employee.findOne({ userId: salary.userId });

        // Create payslip with employee details
        const payslip = await Payslip.create({
          userId: salary.userId,
          employeeId: salary.employeeId,
          employeeName: salary.employeeName,
          designation: employee?.position || '',
          department: employee?.department || '',
          joiningDate: employee?.joinDate || null,
          bankName: employee?.bankName || '',
          bankAccountNumber: employee?.bankAccountNumber || '',
          panNumber: employee?.panNumber || '',
          uan: employee?.uan || '',
          pfNumber: employee?.pfNumber || '',
          month,
          year,
          salaryId: salary._id,
          basicSalary: salary.basicSalary,
          allowances: salary.allowances,
          deductions: salary.deductions,
          grossSalary: salary.grossSalary,
          netSalary: salary.netSalary,
          workingDays: daysInMonth,
          presentDays,
          leaveDays,
          halfDays,
          paidDays,
          finalSalary,
          status: 'Generated',
          generatedBy: generatedBy._id,
          generatedByName: generatedBy.name,
        });

        generatedPayslips.push(payslip);
      } catch (err) {
        errors.push({
          employeeId: salary.employeeId,
          message: err.message,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Generated ${generatedPayslips.length} payslips`,
      data: generatedPayslips,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Generate Payslips Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating payslips',
      error: error.message,
    });
  }
};

// @desc    Get all payslips (HR only)
// @route   GET /api/payslip
// @access  Private (HR)
export const getAllPayslips = async (req, res) => {
  try {
    const { month, year, employeeId, status } = req.query;
    let filter = {};

    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    if (employeeId) filter.employeeId = employeeId;
    if (status) filter.status = status;

    const payslips = await Payslip.find(filter).sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      count: payslips.length,
      data: payslips,
    });
  } catch (error) {
    console.error('Get All Payslips Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payslips',
      error: error.message,
    });
  }
};

// @desc    Get my payslips
// @route   GET /api/payslip/my
// @access  Private (Employee)
export const getMyPayslips = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year } = req.query;

    let filter = { userId };

    if (year) {
      filter.year = parseInt(year);
    }

    const payslips = await Payslip.find(filter).sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      count: payslips.length,
      data: payslips,
    });
  } catch (error) {
    console.error('Get My Payslips Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your payslips',
      error: error.message,
    });
  }
};

// @desc    Download payslip as PDF
// @route   GET /api/payslip/:id/download
// @access  Private (Employee - Own, HR - All)
export const downloadPayslipPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Find payslip
    const payslip = await Payslip.findById(id);

    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found',
      });
    }

    // Check access: Employee can only download own payslip
    if (user.role === 'employee' && payslip.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only download your own payslip',
      });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 30, marginTop: 10 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=payslip_${payslip.employeeId}_${payslip.month}_${payslip.year}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Company Header with Logo and Name
    doc.fontSize(24).fillColor('#10b981').font('Helvetica-Bold').text('BHOOMI TECHZONE', { align: 'center' });
    doc.fontSize(11).fillColor('#6b7280').font('Helvetica').text('Pvt. Ltd.', { align: 'center' });
    doc.fontSize(10).fillColor('#4b5563').font('Helvetica').text('A-43, Sector-63, Noida (201301)', { align: 'center' });
    doc.fontSize(10).fillColor('#4b5563').font('Helvetica').text('Contact: (+91) 8130787194', { align: 'center' });
    doc.moveDown(0.3);
    doc.strokeColor('#10b981').lineWidth(3).moveTo(30, doc.y).lineTo(570, doc.y).stroke();
    doc.moveDown(0.5);

    // Document Title with Month
    const monthName = getMonthName(payslip.month);
    doc.fontSize(16).fillColor('#1e293b').font('Helvetica-Bold').text(`Salary Slip – ${monthName} ${payslip.year}`, { align: 'center' });
    doc.moveDown(0.5);

    // Employee Information
    doc.fontSize(12).fillColor('#1e293b').font('Helvetica-Bold').text('Employee Details', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#475569').font('Helvetica');
    doc.text(`Employee Name: ${payslip.employeeName}`);
    doc.text(`Employee ID: ${payslip.employeeId}`);
    if (payslip.designation) doc.text(`Designation: ${payslip.designation}`);
    if (payslip.department) doc.text(`Department: ${payslip.department}`);
    if (payslip.joiningDate) {
      const joinDate = new Date(payslip.joiningDate).toLocaleDateString('en-IN');
      doc.text(`Joining Date: ${joinDate}`);
    }
    if (payslip.bankName) doc.text(`Bank Name: ${payslip.bankName}`);
    if (payslip.bankAccountNumber) doc.text(`Bank Account Number: ${payslip.bankAccountNumber}`);
    if (payslip.panNumber) doc.text(`PAN: ${payslip.panNumber}`);
    if (payslip.uan) doc.text(`UAN: ${payslip.uan}`);
    if (payslip.pfNumber) doc.text(`PF Number: ${payslip.pfNumber}`);
    doc.moveDown();

    // Attendance Information
    doc.fontSize(12).fillColor('#1e293b').font('Helvetica-Bold').text('Attendance Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#475569');
    doc.text(`Working Days: ${payslip.workingDays}`);
    doc.text(`Present Days: ${payslip.presentDays}`);
    doc.text(`Half Days: ${payslip.halfDays || 0}`);
    doc.text(`Leave Days: ${payslip.leaveDays}`);
    doc.text(`Paid Days: ${payslip.paidDays}`);
    doc.moveDown();

    // Salary Breakdown
    doc.fontSize(12).fillColor('#1e293b').font('Helvetica-Bold').text('Salary Breakdown', { underline: true });
    doc.moveDown(0.5);

    // Earnings
    doc.fontSize(11).fillColor('#16a34a').font('Helvetica-Bold').text('Earnings', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#475569').font('Helvetica');
    doc.text(`Basic Salary: ₹${payslip.basicSalary.toLocaleString('en-IN')}`);
    doc.text(`HRA: ₹${payslip.allowances.HRA.toLocaleString('en-IN')}`);
    doc.text(`DA: ₹${payslip.allowances.DA.toLocaleString('en-IN')}`);
    doc.text(`TA: ₹${payslip.allowances.TA.toLocaleString('en-IN')}`);
    doc.text(`Medical: ₹${payslip.allowances.medical.toLocaleString('en-IN')}`);
    doc.text(`Other: ₹${payslip.allowances.other.toLocaleString('en-IN')}`);
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#16a34a').font('Helvetica-Bold').text(`Gross Salary: ₹${payslip.grossSalary.toLocaleString('en-IN')}`, { underline: true });
    doc.moveDown();

    // Deductions
    doc.fontSize(11).fillColor('#dc2626').font('Helvetica-Bold').text('Deductions', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#475569').font('Helvetica');
    doc.text(`PF: ₹${payslip.deductions.PF.toLocaleString('en-IN')}`);
    doc.text(`Tax: ₹${payslip.deductions.tax.toLocaleString('en-IN')}`);
    doc.text(`Insurance: ₹${payslip.deductions.insurance.toLocaleString('en-IN')}`);
    doc.text(`Other: ₹${payslip.deductions.other.toLocaleString('en-IN')}`);
    doc.moveDown(0.3);
    const totalDeductions = payslip.deductions.PF + payslip.deductions.tax + 
                            payslip.deductions.insurance + payslip.deductions.other;
    doc.fontSize(11).fillColor('#dc2626').font('Helvetica-Bold').text(`Total Deductions: ₹${totalDeductions.toLocaleString('en-IN')}`, { underline: true });
    doc.moveDown();

    // Net Salary
    doc.fontSize(14).fillColor('#1e3a8a').font('Helvetica-Bold').text(
      `Net Salary: ₹${payslip.netSalary.toLocaleString('en-IN')}`,
      { underline: true, align: 'center' }
    );
    doc.moveDown();
    doc.fontSize(14).fillColor('#10b981').font('Helvetica-Bold').text(
      `Final Salary (After Attendance): ₹${payslip.finalSalary.toLocaleString('en-IN')}`,
      { underline: true, align: 'center' }
    );
    doc.moveDown(2);

    // Footer
    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text(
      `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
      { align: 'center' }
    );
    doc.text('This is a computer-generated document. No signature required.', { align: 'center' });
    doc.fontSize(8).fillColor('#cbd5e1').text('© 2025 BHOOMI TECHZONE Pvt. Ltd. All Rights Reserved', { align: 'center' });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Download Payslip PDF Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message,
    });
  }
};

// @desc    Send payslip via email
// @route   POST /api/payslip/:id/email
// @access  Private (Employee - Own, HR - All)
export const sendPayslipEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Find payslip
    const payslip = await Payslip.findById(id);

    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found',
      });
    }

    // Check access: Employee can only email own payslip
    if (user.role === 'employee' && payslip.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only send your own payslip',
      });
    }

    // Get employee email
    const employee = await User.findById(payslip.userId);
    if (!employee || !employee.email) {
      return res.status(404).json({
        success: false,
        message: 'Employee email not found',
      });
    }

    // Create email transporter (configure with your email service)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password',
      },
    });

    // Email content
    const monthName = getMonthName(payslip.month);
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; position: relative; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; position: relative; }
          .watermark { position: absolute; top: 50px; left: 50%; transform: translateX(-50%) rotate(-45deg); font-size: 60px; color: rgba(16, 185, 129, 0.1); font-weight: bold; white-space: nowrap; z-index: 0; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; position: relative; z-index: 1; }
          .header h1 { margin: 0; font-size: 24px; }
          .header .company { font-size: 12px; margin-top: 5px; opacity: 0.9; }
          .header .address { font-size: 11px; margin-top: 3px; opacity: 0.95; }
          .header .contact { font-size: 11px; margin-top: 2px; opacity: 0.95; }
          .header .subtitle { font-size: 14px; margin-top: 8px; opacity: 1; font-weight: bold; }
          .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; position: relative; z-index: 1; }
          .section { margin-bottom: 20px; }
          .section-title { color: #1e293b; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #10b981; padding-bottom: 5px; }
          .info-row { display: flex; justify-content: space-between; padding: 5px 0; }
          .earnings { background: #dcfce7; padding: 10px; border-radius: 5px; margin-bottom: 10px; }
          .deductions { background: #fee2e2; padding: 10px; border-radius: 5px; margin-bottom: 10px; }
          .net-salary { background: #10b981; color: white; padding: 15px; text-align: center; font-size: 20px; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          .footer-company { font-weight: bold; color: #10b981; }
        </style>
      </head>
      <body>
        <div class="watermark">BHOOMI TECHZONE</div>
        <div class="container">
          <div class="header">
            <h1>BHOOMI TECHZONE</h1>
            <div class="company">Pvt. Ltd.</div>
            <div class="address">A-43, Sector-63, Noida (201301)</div>
            <div class="contact">Contact: (+91) 8130787194</div>
            <div class="subtitle">Salary Slip – ${monthName} ${payslip.year}</div>
          </div>
          <div class="content">
            <div class="section">
              <div class="section-title">Employee Details</div>
              <div class="info-row"><span>Employee Name:</span><span>${payslip.employeeName}</span></div>
              <div class="info-row"><span>Employee ID:</span><span>${payslip.employeeId}</span></div>
              ${payslip.designation ? `<div class="info-row"><span>Designation:</span><span>${payslip.designation}</span></div>` : ''}
              ${payslip.department ? `<div class="info-row"><span>Department:</span><span>${payslip.department}</span></div>` : ''}
              ${payslip.joiningDate ? `<div class="info-row"><span>Joining Date:</span><span>${new Date(payslip.joiningDate).toLocaleDateString('en-IN')}</span></div>` : ''}
              ${payslip.bankName ? `<div class="info-row"><span>Bank Name:</span><span>${payslip.bankName}</span></div>` : ''}
              ${payslip.bankAccountNumber ? `<div class="info-row"><span>Bank Account Number:</span><span>${payslip.bankAccountNumber}</span></div>` : ''}
              ${payslip.panNumber ? `<div class="info-row"><span>PAN:</span><span>${payslip.panNumber}</span></div>` : ''}
              ${payslip.uan ? `<div class="info-row"><span>UAN:</span><span>${payslip.uan}</span></div>` : ''}
              ${payslip.pfNumber ? `<div class="info-row"><span>PF Number:</span><span>${payslip.pfNumber}</span></div>` : ''}
            </div>

            <div class="section">
              <div class="section-title">Attendance Summary</div>
              <div class="info-row"><span>Working Days:</span><span>${payslip.workingDays}</span></div>
              <div class="info-row"><span>Present Days:</span><span>${payslip.presentDays}</span></div>
              <div class="info-row"><span>Half Days:</span><span>${payslip.halfDays || 0}</span></div>
              <div class="info-row"><span>Leave Days:</span><span>${payslip.leaveDays}</span></div>
              <div class="info-row"><span>Paid Days:</span><span>${payslip.paidDays}</span></div>
            </div>

            <div class="earnings">
              <div class="section-title">Earnings</div>
              <div class="info-row"><span>Basic Salary:</span><span>₹${payslip.basicSalary.toLocaleString('en-IN')}</span></div>
              <div class="info-row"><span>HRA:</span><span>₹${payslip.allowances.HRA.toLocaleString('en-IN')}</span></div>
              <div class="info-row"><span>DA:</span><span>₹${payslip.allowances.DA.toLocaleString('en-IN')}</span></div>
              <div class="info-row"><span>TA:</span><span>₹${payslip.allowances.TA.toLocaleString('en-IN')}</span></div>
              <div class="info-row"><span>Medical:</span><span>₹${payslip.allowances.medical.toLocaleString('en-IN')}</span></div>
              <div class="info-row"><span>Other:</span><span>₹${payslip.allowances.other.toLocaleString('en-IN')}</span></div>
              <div class="info-row" style="font-weight: bold; border-top: 2px solid #16a34a; margin-top: 5px; padding-top: 5px;">
                <span>Gross Salary:</span><span>₹${payslip.grossSalary.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div class="deductions">
              <div class="section-title">Deductions</div>
              <div class="info-row"><span>PF:</span><span>₹${payslip.deductions.PF.toLocaleString('en-IN')}</span></div>
              <div class="info-row"><span>Tax:</span><span>₹${payslip.deductions.tax.toLocaleString('en-IN')}</span></div>
              <div class="info-row"><span>Insurance:</span><span>₹${payslip.deductions.insurance.toLocaleString('en-IN')}</span></div>
              <div class="info-row"><span>Other:</span><span>₹${payslip.deductions.other.toLocaleString('en-IN')}</span></div>
              <div class="info-row" style="font-weight: bold; border-top: 2px solid #dc2626; margin-top: 5px; padding-top: 5px;">
                <span>Total Deductions:</span><span>₹${(payslip.deductions.PF + payslip.deductions.tax + payslip.deductions.insurance + payslip.deductions.other).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div class="net-salary">
              <div>Net Salary: ₹${payslip.netSalary.toLocaleString('en-IN')}</div>
              <div style="margin-top: 10px; font-size: 18px;">Final Salary: ₹${payslip.finalSalary.toLocaleString('en-IN')}</div>
            </div>

            <div class="footer">
              <p>This is a computer-generated email. Please do not reply.</p>
              <p>© ${new Date().getFullYear()} <span class="footer-company">BHOOMI TECHZONE Pvt. Ltd.</span> All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: employee.email,
      subject: `Payslip - ${monthName} ${payslip.year}`,
      html: emailHTML,
    };

    await transporter.sendMail(mailOptions);

    // Save to employee's dashboard/notifications
    await Notification.create({
      recipientId: payslip.userId,
      type: 'announcement', // Using announcement type for payslips
      title: `📋 Salary Slip for ${monthName} ${payslip.year}`,
      message: `Your salary slip for ${monthName} ${payslip.year} is ready. Basic Salary: ₹${payslip.basicSalary.toLocaleString('en-IN')}`,
      data: {
        payslipId: payslip._id,
        employeeName: payslip.employeeName,
        employeeId: payslip.employeeId,
        month: payslip.month,
        year: payslip.year,
        basicSalary: payslip.basicSalary,
        netSalary: payslip.netSalary,
        relatedId: payslip._id
      },
      icon: 'announcement',
      priority: 'medium',
      link: `/dashboard/payslips/${payslip._id}`,
      isRead: false
    });

    console.log(`✅ Payslip notification saved for user ${payslip.userId}`);

    res.status(200).json({
      success: true,
      message: `Payslip sent successfully to ${employee.email} and saved to dashboard`,
    });

  } catch (error) {
    console.error('Send Payslip Email Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending email',
      error: error.message,
    });
  }
};

// @desc    Send payslip to employee dashboard
// @route   POST /api/payslip/:id/send-to-dashboard
// @access  Private (HR)
export const sendPayslipToDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    console.log('📤 Sending payslip to dashboard - ID:', id);
    console.log('👤 User Role:', user.role);

    // Find payslip
    const payslip = await Payslip.findById(id);

    if (!payslip) {
      console.warn('⚠️ Payslip not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Payslip not found',
      });
    }

    console.log('✅ Payslip found:', { id: payslip._id, userId: payslip.userId });

    // Check access: Only HR can send payslips
    if (user.role !== 'hr') {
      console.warn('⚠️ Unauthorized - User is not HR');
      return res.status(403).json({
        success: false,
        message: 'Only HR can send payslips to employees',
      });
    }

    // Check if notification already exists for this payslip
    const existingNotif = await Notification.findOne({
      'data.relatedId': payslip._id,
      recipientId: payslip.userId
    });

    let notification;
    if (existingNotif) {
      // Update existing notification
      notification = await Notification.findByIdAndUpdate(
        existingNotif._id,
        {
          isRead: false,
          readAt: null,
          createdAt: new Date()
        },
        { new: true }
      );
      console.log('📤 Payslip notification resent');
    } else {
      // Create new notification
      const monthName = getMonthName(payslip.month);
      
      // Format salary values safely
      const netSalaryFormatted = payslip.netSalary ? `₹${payslip.netSalary.toLocaleString('en-IN')}` : '₹0';
      
      console.log('📝 Creating notification with:', {
        recipientId: payslip.userId,
        title: `📋 Salary Slip for ${monthName} ${payslip.year}`,
        message: `Your salary slip for ${monthName} ${payslip.year} is ready. Net Salary: ${netSalaryFormatted}`
      });

      notification = await Notification.create({
        recipientId: payslip.userId,
        type: 'announcement',
        title: `📋 Salary Slip for ${monthName} ${payslip.year}`,
        message: `Your salary slip for ${monthName} ${payslip.year} is ready. Net Salary: ${netSalaryFormatted}`,
        data: {
          payslipId: payslip._id,
          employeeName: payslip.employeeName,
          employeeId: payslip.employeeId,
          month: payslip.month,
          year: payslip.year,
          basicSalary: payslip.basicSalary,
          netSalary: payslip.netSalary,
          grossSalary: payslip.grossSalary,
          relatedId: payslip._id
        },
        icon: 'announcement',
        priority: 'medium',
        link: `/dashboard/payslips/${payslip._id}`,
        isRead: false
      });
      console.log('✅ Payslip notification created:', notification._id);
    }

    res.status(200).json({
      success: true,
      message: `Payslip sent successfully to employee's dashboard`,
      data: notification
    });

  } catch (error) {
    console.error('❌ Send Payslip to Dashboard Error:', error);
    console.error('📋 Error Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error sending payslip to dashboard',
      error: error.message,
    });
  }
};

// @desc    Bulk payment update for payslips
// @route   POST /api/payslip/bulk-payment
// @access  Private (HR)
export const bulkPaymentUpdate = async (req, res) => {
  try {
    const { payslipIds, status, paidDate } = req.body;

    if (!payslipIds || !Array.isArray(payslipIds) || payslipIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide payslip IDs array',
      });
    }

    if (!status || !['Paid', 'Pending', 'Processing'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid status (Paid/Pending/Processing)',
      });
    }

    const updateData = { status };
    
    if (status === 'Paid' && paidDate) {
      updateData.paidDate = new Date(paidDate);
    } else if (status === 'Paid' && !paidDate) {
      updateData.paidDate = new Date();
    }

    const result = await Payslip.updateMany(
      { _id: { $in: payslipIds } },
      { $set: updateData }
    );

    res.status(200).json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} payslips to ${status}`,
      count: result.modifiedCount,
    });

  } catch (error) {
    console.error('Bulk Payment Update Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payslips',
      error: error.message,
    });
  }
};

// @desc    Export payslips to CSV
// @route   GET /api/payslip/export
// @access  Private (HR)
export const exportPayslips = async (req, res) => {
  try {
    const { month, year, status } = req.query;
    let filter = {};

    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    if (status) filter.status = status;

    const payslips = await Payslip.find(filter).sort({ employeeId: 1 });

    if (payslips.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No payslips found for export',
      });
    }

    // Create CSV content
    let csv = 'Employee ID,Employee Name,Month,Year,Basic Salary,HRA,DA,TA,Medical,Other Allowances,Gross Salary,PF,Tax,Insurance,Other Deductions,Net Salary,Working Days,Present Days,Leave Days,Paid Days,Final Salary,Status,Generated Date\n';

    payslips.forEach(payslip => {
      const monthName = getMonthName(payslip.month);
      csv += `${payslip.employeeId},${payslip.employeeName},${monthName},${payslip.year},`;
      csv += `${payslip.basicSalary},${payslip.allowances?.HRA || 0},${payslip.allowances?.DA || 0},`;
      csv += `${payslip.allowances?.TA || 0},${payslip.allowances?.medical || 0},${payslip.allowances?.other || 0},`;
      csv += `${payslip.grossSalary},${payslip.deductions?.PF || 0},${payslip.deductions?.tax || 0},`;
      csv += `${payslip.deductions?.insurance || 0},${payslip.deductions?.other || 0},${payslip.netSalary},`;
      csv += `${payslip.workingDays},${payslip.presentDays},${payslip.leaveDays},${payslip.paidDays},`;
      csv += `${payslip.finalSalary},${payslip.status},${new Date(payslip.generatedDate).toLocaleDateString()}\n`;
    });

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=payslips_${month || 'all'}_${year || 'all'}.csv`);
    res.status(200).send(csv);

  } catch (error) {
    console.error('Export Payslips Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting payslips',
      error: error.message,
    });
  }
};

// @desc    Generate and send payslip in one action
// @route   POST /api/payslip/generate-and-send
// @access  Private (HR)
export const generateAndSendPayslip = async (req, res) => {
  try {
    const { employeeIds, month, year, message } = req.body;
    const generatedBy = req.user;

    console.log('📋 generateAndSendPayslip called');
    console.log('📦 Request Body:', { employeeIds, month, year, message });
    console.log('👤 Generated By:', generatedBy?.email);

    // Validation
    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      console.error('❌ Validation Error: No employee IDs provided');
      return res.status(400).json({
        success: false,
        message: 'Please provide employee IDs'
      });
    }

    if (!month || !year) {
      console.error('❌ Validation Error: Month or year missing');
      return res.status(400).json({
        success: false,
        message: 'Please provide month and year'
      });
    }

    console.log(`✅ Validation passed. Processing ${employeeIds.length} employees`);
    const results = [];
    const errors = [];

    for (const empId of employeeIds) {
      try {
        // Get employee first (from Employee collection or User)
        let employee = await Employee.findById(empId);
        let userId = employee?.userId || empId;

        // If still not found, try using empId as userId
        if (!employee) {
          employee = await Employee.findOne({ userId: empId });
          userId = empId;
        }

        // Get salary for employee
        let salary = await Salary.findOne({ 
          userId: userId,
          isActive: true 
        });

        // If no salary found with userId, try with employee ID
        if (!salary && employee) {
          salary = await Salary.findOne({
            $or: [
              { userId: employee.userId },
              { employeeId: employee.employeeId }
            ],
            isActive: true
          });
        }

        if (!salary) {
          errors.push({
            employeeId: employee?.employeeId || empId,
            message: 'No active salary record found for employee. Please set up salary first.'
          });
          continue;
        }

        userId = salary.userId;

        // Check if payslip already exists
        let payslip = await Payslip.findOne({
          userId: userId,
          month,
          year
        });

        // If not exists, create it
        if (!payslip) {
          const startDate = new Date(year, month - 1, 1);
          const endDate = new Date(year, month, 0, 23, 59, 59);
          const daysInMonth = new Date(year, month, 0).getDate();

          const attendanceRecords = await Attendance.find({
            userId: userId,
            date: { $gte: startDate, $lte: endDate }
          });

          const presentDays = attendanceRecords.filter(
            a => a.status === 'Present' || a.status === 'Late'
          ).length;

          const halfDays = attendanceRecords.filter(
            a => a.status === 'Half Day'
          ).length;

          const approvedLeaves = await Leave.find({
            userId: userId,
            status: 'Approved',
            startDate: { $lte: endDate },
            endDate: { $gte: startDate }
          });

          const leaveDays = approvedLeaves.reduce((sum, leave) => sum + leave.totalDays, 0);
          const paidDays = Math.min(presentDays + (halfDays * 0.5) + leaveDays, daysInMonth);
          const perDaySalary = salary.netSalary / daysInMonth;
          const finalSalary = Math.round(perDaySalary * paidDays);

          payslip = await Payslip.create({
            userId: userId,
            employeeId: salary.employeeId,
            employeeName: salary.employeeName,
            designation: employee?.position || '',
            department: employee?.department || '',
            joiningDate: employee?.joinDate || null,
            bankName: employee?.bankName || '',
            bankAccountNumber: employee?.bankAccountNumber || '',
            panNumber: employee?.panNumber || '',
            uan: employee?.uan || '',
            pfNumber: employee?.pfNumber || '',
            month,
            year,
            salaryId: salary._id,
            basicSalary: salary.basicSalary,
            allowances: salary.allowances,
            deductions: salary.deductions,
            grossSalary: salary.grossSalary,
            netSalary: salary.netSalary,
            workingDays: daysInMonth,
            presentDays,
            leaveDays,
            halfDays,
            paidDays,
            finalSalary,
            status: 'Generated',
            generatedBy: generatedBy._id,
            generatedByName: generatedBy.name
          });
        }

        // Get employee email
        const empUser = await User.findById(userId);
        if (!empUser || !empUser.email) {
          errors.push({
            employeeId: salary.employeeId,
            message: 'Employee email not found'
          });
          continue;
        }

        // Send email with better error handling
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER || 'your-email@gmail.com',
              pass: process.env.EMAIL_PASSWORD || 'your-app-password'
            }
          });

          const monthName = getMonthName(payslip.month);
          const emailHTML = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #1e3a8a 0%, #0891b2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
                .section { margin-bottom: 20px; }
                .section-title { color: #1e293b; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #0891b2; padding-bottom: 5px; }
                .info-row { display: flex; justify-content: space-between; padding: 5px 0; }
                .earnings { background: #dcfce7; padding: 10px; border-radius: 5px; margin-bottom: 10px; }
                .deductions { background: #fee2e2; padding: 10px; border-radius: 5px; margin-bottom: 10px; }
                .net-salary { background: #1e3a8a; color: white; padding: 15px; text-align: center; font-size: 20px; border-radius: 5px; margin-top: 20px; }
                .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>HRMS Company</h1>
                  <p>Monthly Payslip - ${monthName} ${payslip.year}</p>
                </div>
                <div class="content">
                  <div class="section">
                    <div class="section-title">Employee Information</div>
                    <div class="info-row"><span>Employee ID:</span><span>${payslip.employeeId}</span></div>
                    <div class="info-row"><span>Employee Name:</span><span>${payslip.employeeName}</span></div>
                    <div class="info-row"><span>Month:</span><span>${monthName} ${payslip.year}</span></div>
                  </div>

                  <div class="section">
                    <div class="section-title">Attendance Summary</div>
                    <div class="info-row"><span>Working Days:</span><span>${payslip.workingDays}</span></div>
                    <div class="info-row"><span>Present Days:</span><span>${payslip.presentDays}</span></div>
                    <div class="info-row"><span>Leave Days:</span><span>${payslip.leaveDays}</span></div>
                    <div class="info-row"><span>Paid Days:</span><span>${payslip.paidDays}</span></div>
                  </div>

                  <div class="earnings">
                    <div class="section-title">Earnings</div>
                    <div class="info-row"><span>Basic Salary:</span><span>₹${payslip.basicSalary.toLocaleString('en-IN')}</span></div>
                    <div class="info-row"><span>HRA:</span><span>₹${(payslip.allowances?.HRA || 0).toLocaleString('en-IN')}</span></div>
                    <div class="info-row"><span>DA:</span><span>₹${(payslip.allowances?.DA || 0).toLocaleString('en-IN')}</span></div>
                    <div class="info-row"><span>TA:</span><span>₹${(payslip.allowances?.TA || 0).toLocaleString('en-IN')}</span></div>
                    <div class="info-row"><span>Medical:</span><span>₹${(payslip.allowances?.medical || 0).toLocaleString('en-IN')}</span></div>
                    <div class="info-row"><span>Other:</span><span>₹${(payslip.allowances?.other || 0).toLocaleString('en-IN')}</span></div>
                    <div class="info-row" style="font-weight: bold; border-top: 2px solid #16a34a; margin-top: 5px; padding-top: 5px;">
                      <span>Gross Salary:</span><span>₹${payslip.grossSalary.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div class="deductions">
                    <div class="section-title">Deductions</div>
                    <div class="info-row"><span>PF:</span><span>₹${(payslip.deductions?.PF || 0).toLocaleString('en-IN')}</span></div>
                    <div class="info-row"><span>Tax:</span><span>₹${(payslip.deductions?.tax || 0).toLocaleString('en-IN')}</span></div>
                    <div class="info-row"><span>Insurance:</span><span>₹${(payslip.deductions?.insurance || 0).toLocaleString('en-IN')}</span></div>
                    <div class="info-row"><span>Other:</span><span>₹${(payslip.deductions?.other || 0).toLocaleString('en-IN')}</span></div>
                    <div class="info-row" style="font-weight: bold; border-top: 2px solid #dc2626; margin-top: 5px; padding-top: 5px;">
                      <span>Total Deductions:</span><span>₹${((payslip.deductions?.PF || 0) + (payslip.deductions?.tax || 0) + (payslip.deductions?.insurance || 0) + (payslip.deductions?.other || 0)).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div class="net-salary">
                    <div>Net Salary: ₹${payslip.netSalary.toLocaleString('en-IN')}</div>
                    <div style="margin-top: 10px; font-size: 18px;">Final Salary: ₹${payslip.finalSalary.toLocaleString('en-IN')}</div>
                  </div>

                  <div class="footer">
                    <p>${message || 'Your monthly salary slip is enclosed.'}</p>
                    <p>This is a computer-generated email. Please do not reply.</p>
                    <p>© ${new Date().getFullYear()} HRMS Company. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `;

          const mailOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to: empUser.email,
            subject: `Payslip - ${monthName} ${payslip.year}`,
            html: emailHTML
          };

          await transporter.sendMail(mailOptions);

          results.push({
            employeeId: salary.employeeId,
            employeeName: salary.employeeName,
            email: empUser.email,
            status: 'Email Sent'
          });
        } catch (emailError) {
          errors.push({
            employeeId: salary.employeeId,
            message: `Email failed: ${emailError.message}`
          });
        }

      } catch (err) {
        console.error('Error processing employee:', empId, err);
        errors.push({
          employeeId: empId,
          message: err.message
        });
      }
    }

    if (results.length === 0 && errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'No payslips could be sent',
        errors: errors
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully sent ${results.length} salary slips. ${errors.length > 0 ? `Failed to send ${errors.length}` : ''}`,
      data: results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Generate and Send Payslip Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payslips',
      error: error.message
    });
  }
};

// Helper function to get month name
function getMonthName(month) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || 'Unknown';
}
