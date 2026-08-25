const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllPrograms = async (req, res) => {
  try {
    const programs = await prisma.program.findMany({
      include: {
        courses: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ error: 'Server error fetching programs' });
  }
};

exports.createProgram = async (req, res) => {
  try {
    const { code, name, department } = req.body;
    
    if (!code || !name) {
      return res.status(400).json({ error: 'Code and Name are required' });
    }

    const existingProgram = await prisma.program.findUnique({ where: { code } });
    if (existingProgram) {
      return res.status(400).json({ error: 'Program code already exists' });
    }

    const program = await prisma.program.create({
      data: { code, name, department }
    });

    // Log the action
    if (req.user && req.user.id) {
      await prisma.systemLog.create({
        data: {
          userId: req.user.id,
          actionType: 'PROGRAM_CREATED',
          description: `Created new academic program: ${code} - ${name}`,
          ipAddress: req.ip || req.connection.remoteAddress
        }
      });
    }
    
    res.status(201).json(program);
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({ error: 'Server error creating program' });
  }
};

exports.updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, department } = req.body;

    const program = await prisma.program.findUnique({ where: { id } });
    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    if (code && code !== program.code) {
      const existing = await prisma.program.findUnique({ where: { code } });
      if (existing) {
        return res.status(400).json({ error: 'Program code already exists' });
      }
    }

    const updatedProgram = await prisma.program.update({
      where: { id },
      data: {
        code: code || program.code,
        name: name || program.name,
        department: department !== undefined ? department : program.department
      }
    });

    // Log the action
    if (req.user && req.user.id) {
      await prisma.systemLog.create({
        data: {
          userId: req.user.id,
          actionType: 'PROGRAM_EDITED',
          description: `Edited academic program: ${updatedProgram.code} - ${updatedProgram.name}`,
          ipAddress: req.ip || req.connection.remoteAddress
        }
      });
    }

    res.json(updatedProgram);
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({ error: 'Server error updating program' });
  }
};

exports.deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch the program first to get its name and code for logging
    const program = await prisma.program.findUnique({ where: { id } });
    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    await prisma.program.delete({ where: { id } });

    // Log the action
    if (req.user && req.user.id) {
      await prisma.systemLog.create({
        data: {
          userId: req.user.id,
          actionType: 'PROGRAM_DELETED',
          description: `Deleted academic program: ${program.code} - ${program.name}`,
          ipAddress: req.ip || req.connection.remoteAddress
        }
      });
    }

    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({ error: 'Server error deleting program' });
  }
};
