import Document from '../models/Document.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import fs from 'fs';
import path from 'path';

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private (Employee and HR)
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    const { documentType, documentName, remarks, uploadForEmployeeId } = req.body;
    const user = req.user;

    console.log('=== UPLOAD DOCUMENT DEBUG ===');
    console.log('User ID:', user._id);
    console.log('User employeeId:', user.employeeId);
    console.log('User name:', user.name);
    console.log('User role:', user.role);
    console.log('Document type:', documentType);
    console.log('Document name:', documentName);
    console.log('Upload for employee ID:', uploadForEmployeeId);

    // Validation
    if (!documentType || !documentName) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Please provide documentType and documentName',
      });
    }

    // Determine whose document this is
    let documentUserId = user._id;
    let documentEmployeeId = user.employeeId;
    let documentEmployeeName = user.name;
    
    // If HR is uploading for an employee
    if (uploadForEmployeeId && user.role === 'hr') {
      console.log('HR uploading for employee:', uploadForEmployeeId);
      
      // Find the employee to get their User ID
      const employee = await Employee.findOne({ employeeId: uploadForEmployeeId });
      if (!employee) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({
          success: false,
          message: 'Employee not found',
        });
      }
      
      documentUserId = employee.userId;
      documentEmployeeId = employee.employeeId;
      documentEmployeeName = employee.name;
      console.log('Found employee - UserId:', documentUserId, 'EmployeeId:', documentEmployeeId);
    } else if (uploadForEmployeeId && user.role !== 'hr') {
      // Only HR can upload for other employees
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        message: 'Only HR can upload documents for employees',
      });
    }

    // Create document record
    // If HR is uploading, mark as Approved automatically
    const documentStatus = (uploadForEmployeeId && user.role === 'hr') ? 'Approved' : 'Pending';
    const approvedBy = (uploadForEmployeeId && user.role === 'hr') ? user._id : null;
    const approvedByName = (uploadForEmployeeId && user.role === 'hr') ? user.name : null;
    const approvedDate = (uploadForEmployeeId && user.role === 'hr') ? new Date() : null;

    const document = await Document.create({
      userId: documentUserId,
      employeeId: documentEmployeeId,
      employeeName: documentEmployeeName,
      documentType,
      documentName,
      documentUrl: req.file.path,
      fileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      remarks: remarks || '',
      status: documentStatus,
      approvedBy: approvedBy,
      approvedByName: approvedByName,
      approvedDate: approvedDate,
    });

    console.log('Document created with ID:', document._id);
    console.log('Document employeeId:', document.employeeId);
    console.log('Document status:', document.status);
    if (uploadForEmployeeId) {
      console.log('HR uploaded for employee - Status: APPROVED');
    }

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document,
    });
  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload Document Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message,
    });
  }
};

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private (HR and Employee for their own docs)
export const getAllDocuments = async (req, res) => {
  try {
    const { status, documentType, employeeId, userId } = req.query;
    const user = req.user;
    
    console.log('=== GET DOCUMENTS DEBUG ===');
    console.log('Query employeeId:', employeeId);
    console.log('Query userId:', userId);
    console.log('User employeeId:', user.employeeId);
    console.log('User userId:', user._id);
    console.log('User role:', user.role);
    
    let filter = {};
    
    // HR requesting ALL documents (no specific employee filter)
    if (user.role === 'hr' && !employeeId && !userId) {
      console.log('HR requesting ALL documents');
      // Don't add any employee filter - get all documents
    }
    // If filtering by userId (most reliable)
    else if (userId) {
      console.log('Filtering by userId');
      // Employee requesting their own documents
      if (userId === user._id.toString() || user.role === 'hr') {
        filter.userId = userId;
      } else {
        console.log('User cannot view other documents');
        return res.status(403).json({
          success: false,
          message: 'You can only view your own documents',
        });
      }
    } 
    // If employee is requesting their own documents via employeeId
    else if (employeeId && user.employeeId === employeeId) {
      filter.employeeId = employeeId;
      console.log('Employee requesting own documents by employeeId');
    } 
    // HR requesting documents for specific employee
    else if (employeeId && user.role === 'hr') {
      filter.employeeId = employeeId;
      console.log('HR requesting documents for employee:', employeeId);
    }
    // Employee trying to access other employee's documents
    else if (employeeId && user.role !== 'hr') {
      console.log('Employee trying to access other employee documents - REJECTED');
      return res.status(403).json({
        success: false,
        message: 'You can only view your own documents',
      });
    }
    
    // Filter by status
    if (status) {
      filter.status = status;
    }
    
    // Filter by document type
    if (documentType) {
      filter.documentType = documentType;
    }
    
    console.log('Final filter:', filter);
    
    const documents = await Document.find(filter).sort({ uploadDate: -1 });
    console.log('Found documents:', documents.length);
    console.log('Document IDs:', documents.map(d => ({ id: d._id, userId: d.userId, employeeId: d.employeeId, name: d.documentName })));

    // Calculate statistics
    const totalDocuments = documents.length;
    const pendingDocuments = documents.filter(d => d.status === 'Pending').length;
    const approvedDocuments = documents.filter(d => d.status === 'Approved').length;
    const rejectedDocuments = documents.filter(d => d.status === 'Rejected').length;

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
      statistics: {
        total: totalDocuments,
        pending: pendingDocuments,
        approved: approvedDocuments,
        rejected: rejectedDocuments,
      },
    });
  } catch (error) {
    console.error('Get All Documents Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents',
      error: error.message,
    });
  }
};

// @desc    Get my documents
// @route   GET /api/documents/my
// @access  Private (Employee)
export const getMyDocuments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, documentType } = req.query;

    let filter = { userId };

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by document type
    if (documentType) {
      filter.documentType = documentType;
    }

    const documents = await Document.find(filter).sort({ uploadDate: -1 });

    // Calculate statistics
    const totalDocuments = documents.length;
    const pendingDocuments = documents.filter(d => d.status === 'Pending').length;
    const approvedDocuments = documents.filter(d => d.status === 'Approved').length;
    const rejectedDocuments = documents.filter(d => d.status === 'Rejected').length;

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
      statistics: {
        total: totalDocuments,
        pending: pendingDocuments,
        approved: approvedDocuments,
        rejected: rejectedDocuments,
      },
    });
  } catch (error) {
    console.error('Get My Documents Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your documents',
      error: error.message,
    });
  }
};

// @desc    Approve document
// @route   PUT /api/documents/:id/approve
// @access  Private (HR)
export const approveDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const approver = req.user;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    if (document.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Document is already ${document.status}`,
      });
    }

    // Update document status
    document.status = 'Approved';
    document.approvedBy = approver._id;
    document.approvedByName = approver.name;
    document.approvedDate = new Date();

    await document.save();

    res.status(200).json({
      success: true,
      message: 'Document approved successfully',
      data: document,
    });
  } catch (error) {
    console.error('Approve Document Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving document',
      error: error.message,
    });
  }
};

// @desc    Reject document
// @route   PUT /api/documents/:id/reject
// @access  Private (HR)
export const rejectDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const approver = req.user;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    if (document.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Document is already ${document.status}`,
      });
    }

    // Update document status
    document.status = 'Rejected';
    document.approvedBy = approver._id;
    document.approvedByName = approver.name;
    document.rejectedDate = new Date();
    document.rejectionReason = rejectionReason || 'No reason provided';

    await document.save();

    res.status(200).json({
      success: true,
      message: 'Document rejected successfully',
      data: document,
    });
  } catch (error) {
    console.error('Reject Document Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting document',
      error: error.message,
    });
  }
};

// @desc    Upload employee document
// @route   POST /api/employees/:id/documents
// @access  Private (HR)
export const uploadEmployeeDocument = async (req, res) => {
  try {
    const { id: employeeId } = req.params;
    const { name, type } = req.body;

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // If file is uploaded, create document record
    if (req.file) {
      const document = {
        _id: new Date().getTime().toString(),
        name: name || req.file.originalname,
        type: type || 'PDF',
        uploadDate: new Date(),
        fileName: req.file.filename,
        filePath: req.file.path,
        fileSize: req.file.size,
      };

      // Add document to employee's documents array
      if (!employee.documents) {
        employee.documents = [];
      }
      employee.documents.push(document);
      await employee.save();

      return res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: document,
      });
    }

    // If no file but has name (document name only, no file)
    const document = {
      _id: new Date().getTime().toString(),
      name: name || 'Unnamed Document',
      type: type || 'PDF',
      uploadDate: new Date(),
    };

    if (!employee.documents) {
      employee.documents = [];
    }
    employee.documents.push(document);
    await employee.save();

    res.status(201).json({
      success: true,
      message: 'Document added successfully',
      data: document,
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload Employee Document Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message,
    });
  }
};

// @desc    Delete employee document
// @route   DELETE /api/employees/:id/documents/:docId
// @access  Private (HR)
export const deleteEmployeeDocument = async (req, res) => {
  try {
    const { id: employeeId, docId } = req.params;

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Find and remove document
    if (!employee.documents) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const documentIndex = employee.documents.findIndex(doc => doc._id.toString() === docId);
    
    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const document = employee.documents[documentIndex];

    // Delete file if it exists
    if (document.filePath) {
      try {
        fs.unlinkSync(document.filePath);
      } catch (err) {
        console.log('File not found, continuing with deletion');
      }
    }

    // Remove document from array
    employee.documents.splice(documentIndex, 1);
    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Delete Employee Document Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: error.message,
    });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Delete file if it exists
    if (document.documentUrl) {
      try {
        fs.unlinkSync(document.documentUrl);
      } catch (err) {
        console.log('File not found, continuing with deletion');
      }
    }

    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Delete Document Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: error.message,
    });
  }
};

// @desc    Download document
// @route   GET /api/documents/:id/download
// @access  Private
export const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check file exists
    if (!fs.existsSync(document.documentUrl)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server',
      });
    }

    console.log('📥 Downloading file:', document.documentUrl);
    console.log('Original filename:', document.fileName);

    // Send file with proper headers
    res.download(document.documentUrl, document.fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
    });
  } catch (error) {
    console.error('Download Document Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading document',
      error: error.message,
    });
  }
};
