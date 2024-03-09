const Semester = require('../models/semesterModel');

const semesterController = {
  // READ (tất cả học kỳ)
  async getSemesters(req, res) {
    const semesters = await Semester.find();
    res.json(semesters);
  },

  // CREATE (tạo học kỳ mới)
  async createSemester(req, res) {
    try {
      const newSemester = new Semester(req.body);
      await newSemester.save();
      res.json(newSemester);
    } catch (err) {
      if (err.code === 11000) { // Handle duplicate academic year error
        return res.status(400).send('Academic year must be unique');
      }
      return res.status(500).send('Error creating semester');
    }
  },

  // UPDATE (cập nhật học kỳ) - Tùy chọn, cần đảm bảo tính hợp lệ
  async updateSemester(req, res) {
    const { id } = req.params;
    const updatedSemester = await Semester.findByIdAndUpdate(id, req.body, { new: true }); // Return updated document
    if (!updatedSemester) {
      return res.status(404).send('Semester not found');
    }
    res.json(updatedSemester);
  },

  // DELETE (xóa học kỳ) - Tùy chọn, cần đảm bảo tính hợp lệ
  async deleteSemester(req, res) {
    const { id } = req.params;
    await Semester.findByIdAndRemove(id);
    res.json({ message: 'Semester deleted' });
  },
};

module.exports = semesterController;