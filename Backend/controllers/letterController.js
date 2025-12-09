import Letter from '../models/Letter.js';
import Employee from '../models/Employee.js';
import User from '../models/user.js';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

// Configure email transporter (use environment variables)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password',
  },
});

// Letter templates with dynamic content
const getLetterTemplate = (letterType, data, employeeName) => {
  const templates = {
    offer: () => `
OFFER LETTER

Date: ${new Date().toLocaleDateString()}

Dear ${employeeName},

We are pleased to extend this offer for the position of ${data.position} in the ${data.department} department.

Position Details:
• Position: ${data.position}
• Department: ${data.department}
• Joining Date: ${new Date(data.joiningDate).toLocaleDateString()}
• Annual Salary: ₹${Number(data.salary).toLocaleString('en-IN')}
• CTC: ₹${Number(data.ctc).toLocaleString('en-IN')}
• Reporting Manager: ${data.reportingManager}

We believe you will be a valuable addition to our team. Please confirm your acceptance of this offer by signing and returning this letter.

Best regards,
Human Resources Department
    `,

    joining: () => `
JOINING LETTER

Date: ${new Date().toLocaleDateString()}

Dear ${employeeName},

Welcome to our organization! This letter confirms that you have been appointed as ${data.position} in the ${data.department} department.

Appointment Details:
• Position: ${data.position}
• Department: ${data.department}
• Joining Date: ${new Date(data.joiningDate).toLocaleDateString()}
• Reporting Manager: ${data.reportingManager}

Please ensure you complete all necessary documentation and formalities on your joining date. Your reporting time is 9:00 AM.

We look forward to your contribution and growth in our organization.

Best regards,
Human Resources Department
    `,

    confirmation: () => `
CONFIRMATION LETTER

Date: ${new Date().toLocaleDateString()}

Dear ${employeeName},

We are pleased to confirm your continuation with our organization as ${data.position} in the ${data.department} department.

Confirmation Details:
• Position: ${data.position}
• Department: ${data.department}
• Probation Period Completed: ${data.probationPeriod} months
• Confirmation Date: ${new Date(data.confirmationDate).toLocaleDateString()}

Your performance during the probation period has been satisfactory, and we are confident in your abilities and contribution to the team.

Best regards,
Human Resources Department
    `,

    promotion: () => `
PROMOTION LETTER

Date: ${new Date().toLocaleDateString()}

Dear ${employeeName},

We are delighted to inform you about your promotion in recognition of your excellent performance and contributions.

Promotion Details:
• Current Position: ${data.currentPosition}
• New Position: ${data.newPosition}
• Department: ${data.department}
• Effective Date: ${new Date(data.effectiveDate).toLocaleDateString()}
• New Salary: ₹${Number(data.newSalary).toLocaleString('en-IN')}
${data.promotionBenefits ? `• Benefits: ${data.promotionBenefits}` : ''}

This promotion is a testament to your dedication and outstanding work. We are confident that you will continue to excel in your new role.

Best regards,
Human Resources Department
    `,

    increment: () => `
INCREMENT LETTER

Date: ${new Date().toLocaleDateString()}

Dear ${employeeName},

We are pleased to inform you about the salary increment approved for you.

Increment Details:
• Position: ${data.position}
• Current Salary: ₹${Number(data.currentSalary).toLocaleString('en-IN')}
• New Salary: ₹${Number(data.newSalary).toLocaleString('en-IN')}
• Increment: ₹${(Number(data.newSalary) - Number(data.currentSalary)).toLocaleString('en-IN')} (${data.incrementPercentage || 'N/A'}%)
• Effective Date: ${new Date(data.effectiveDate).toLocaleDateString()}

This increment reflects our appreciation for your consistent performance and commitment to the organization.

Best regards,
Human Resources Department
    `,

    pip: () => `
PERFORMANCE IMPROVEMENT PLAN (PIP) LETTER

Date: ${new Date().toLocaleDateString()}

Dear ${employeeName},

This letter serves as formal notification of a Performance Improvement Plan (PIP) for your role as ${data.position}.

PIP Details:
• Start Date: ${new Date(data.startDate).toLocaleDateString()}
• Duration: ${data.pipDuration} month(s)
• Reason: ${data.pipReason}
• Reporting Manager: ${data.reportingManager}

Expected Performance Improvements:
${data.expectations}

You will have regular review meetings with your manager to assess progress. Please ensure you meet all expectations outlined in this plan.

Best regards,
Human Resources Department
    `,

    warning: () => `
WARNING LETTER

Date: ${new Date().toLocaleDateString()}

Dear ${employeeName},

This letter serves as a formal warning regarding your professional conduct as ${data.position}.

Warning Details:
• Issue Date: ${new Date(data.issueDate).toLocaleDateString()}
• Reason: ${data.warningReason}
• Correction Period: ${data.correctionPeriod} day(s)
${data.consequences ? `• Consequences: ${data.consequences}` : ''}

You are required to improve your performance and conduct within the specified period. Failure to do so may result in further disciplinary action.

Best regards,
Human Resources Department
    `,

    experience: () => `
EXPERIENCE LETTER

Date: ${new Date().toLocaleDateString()}

Dear ${employeeName},

This letter certifies that you have worked with our organization in the capacity of ${data.position} in the ${data.department} department.

Employment Details:
• Position: ${data.position}
• Department: ${data.department}
• Joining Date: ${new Date(data.joiningDate).toLocaleDateString()}
• Exit Date: ${new Date(data.exitDate).toLocaleDateString()}

Key Responsibilities:
${data.responsibility || 'N/A'}

Performance Summary:
${data.performance || 'The employee has performed their duties satisfactorily.'}

We appreciate your contributions and wish you success in your future endeavors.

Best regards,
Human Resources Department
    `,

    internship: () => `
INTERNSHIP LETTER

Date: ${new Date().toLocaleDateString()}

Dear ${employeeName},

We are pleased to offer you an internship position with our organization.

Internship Details:
• Position: ${data.position}
• Department: ${data.department}
• Duration: ${data.duration} month(s)
• Start Date: ${new Date(data.startDate).toLocaleDateString()}
${data.stipend ? `• Monthly Stipend: ₹${Number(data.stipend).toLocaleString('en-IN')}` : '• Stipend: Unpaid'}
${data.mentor ? `• Assigned Mentor: ${data.mentor}` : ''}

This internship will provide you with valuable experience and exposure to our industry. We look forward to working with you.

Best regards,
Human Resources Department
    `,
  };

  return templates[letterType]?.() || 'Invalid letter type';
};

// Generate PDF
const generatePDF = async (letterContent, letterType, employeeName) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 50,
        bufferPages: true,
      });

      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('error', reject);
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Company Header
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('BHOOMI TECHZONE Pvt. Ltd.', { align: 'center' })
        .moveDown(0.3);

      doc
        .fontSize(11)
        .font('Helvetica')
        .text('A-43, Sector-63, Noida (201301)', { align: 'center' })
        .moveDown(0.2);

      doc
        .fontSize(10)
        .text('Contact: (+91) 8130787194', { align: 'center' })
        .moveDown(1.5);

      // Divider line
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(1);

      // Letter Type
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(letterType.replace(/([A-Z])/g, ' $1').toUpperCase(), { align: 'center' })
        .moveDown(2);

      // Letter content
      doc.fontSize(11).font('Helvetica').text(letterContent, { align: 'left' });

      // Footer
      doc.moveDown(2).fontSize(10).text('---', { align: 'center' });
      doc.text('Generated by BHOOMI TECHZONE on ' + new Date().toLocaleDateString(), {
        align: 'center',
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

// Generate Letter
export const generateLetter = async (req, res) => {
  try {
    const { employeeId, letterType, letterData, employeeName, employeeEmail } = req.body;
    const createdBy = req.user._id;

    console.log('📝 [LETTER GENERATION] Received request:', {
      employeeId,
      letterType,
      employeeName,
      createdBy: createdBy.toString(),
    });

    // Validate employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      console.error('❌ [LETTER GENERATION] Employee not found:', employeeId);
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    console.log('✅ [LETTER GENERATION] Employee found:', {
      employeeId: employee._id,
      employeeName: employee.name,
      userId: employee.userId,
    });

    // Check if employee has userId
    if (!employee.userId) {
      console.error('❌ [LETTER GENERATION] Employee has no userId linked');
      return res.status(400).json({
        success: false,
        message: 'Employee has no user account linked',
      });
    }

    // Get letter template
    const letterContent = getLetterTemplate(letterType, letterData, employeeName);

    // Generate PDF
    const pdfBuffer = await generatePDF(letterContent, letterType, employeeName);

    // Create letter record
    const letter = await Letter.create({
      employeeId,
      userId: employee.userId,
      employeeEmail,
      employeeName,
      employeePosition: employee.position,
      letterType,
      letterData,
      pdfBuffer,
      createdBy,
      status: 'draft',
    });

    console.log('✅ [LETTER GENERATION] Letter created successfully:', {
      letterId: letter._id,
      userId: letter.userId,
      status: letter.status,
    });

    res.status(201).json({
      success: true,
      message: 'Letter generated successfully',
      data: {
        _id: letter._id,
        letterType: letter.letterType,
        employeeName: letter.employeeName,
        status: letter.status,
        createdAt: letter.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ [LETTER GENERATION] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error generating letter',
      error: error.message,
    });
  }
};

// Get all letters (HR - sees all)
export const getAllLetters = async (req, res) => {
  try {
    const letters = await Letter.find({})
      .populate('employeeId', 'name employeeId position')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: letters,
    });
  } catch (error) {
    console.error('Get Letters Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching letters',
      error: error.message,
    });
  }
};

// Get letters for specific employee
export const getEmployeeLetters = async (req, res) => {
  try {
    const userId = req.user._id;

    const letters = await Letter.find({ userId })
      .select('-pdfBuffer')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: letters,
    });
  } catch (error) {
    console.error('Get Employee Letters Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching letters',
      error: error.message,
    });
  }
};

// Download letter (PDF)
export const downloadLetter = async (req, res) => {
  try {
    const { id } = req.params;

    const letter = await Letter.findById(id);
    if (!letter) {
      return res.status(404).json({
        success: false,
        message: 'Letter not found',
      });
    }

    // Update download status
    letter.status = 'downloaded';
    letter.downloadedAt = new Date();
    letter.viewedByEmployee = true;
    letter.viewedAt = new Date();
    await letter.save();

    // Send PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${letter.letterType}-${letter.employeeName}-${letter._id}.pdf"`
    );
    res.send(letter.pdfBuffer);
  } catch (error) {
    console.error('Download Letter Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading letter',
      error: error.message,
    });
  }
};

// Send letter (via email)
export const sendLetter = async (req, res) => {
  try {
    const { id } = req.params;

    const letter = await Letter.findById(id);
    if (!letter) {
      return res.status(404).json({
        success: false,
        message: 'Letter not found',
      });
    }

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@hrms.com',
      to: letter.employeeEmail,
      subject: `${letter.letterType.replace(/([A-Z])/g, ' $1').toUpperCase()} - HRMS`,
      text: `Dear ${letter.employeeName},\n\nPlease find your letter attached.\n\nBest regards,\nHuman Resources Department`,
      attachments: [
        {
          filename: `${letter.letterType}-${letter.employeeName}.pdf`,
          content: letter.pdfBuffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    // Update letter status
    letter.status = 'sent';
    letter.sentAt = new Date();
    letter.emailSent = true;
    await letter.save();

    res.status(200).json({
      success: true,
      message: 'Letter sent successfully',
      data: {
        _id: letter._id,
        status: letter.status,
        sentAt: letter.sentAt,
      },
    });
  } catch (error) {
    console.error('Send Letter Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending letter',
      error: error.message,
    });
  }
};

// Mark letter as viewed
export const viewLetter = async (req, res) => {
  try {
    const { id } = req.params;

    const letter = await Letter.findByIdAndUpdate(
      id,
      {
        viewedByEmployee: true,
        viewedAt: new Date(),
      },
      { new: true }
    );

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: 'Letter not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Letter marked as viewed',
      data: letter,
    });
  } catch (error) {
    console.error('View Letter Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking letter as viewed',
      error: error.message,
    });
  }
};

// Delete letter (HR only)
export const deleteLetter = async (req, res) => {
  try {
    const { id } = req.params;

    const letter = await Letter.findByIdAndDelete(id);
    if (!letter) {
      return res.status(404).json({
        success: false,
        message: 'Letter not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Letter deleted successfully',
    });
  } catch (error) {
    console.error('Delete Letter Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting letter',
      error: error.message,
    });
  }
};
