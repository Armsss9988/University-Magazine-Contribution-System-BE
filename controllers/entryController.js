const Entry = require('../models/entryModel');

const entryController = {
  // READ (với phân quyền)
  async getEntries(req, res) {
    const { role, facultyId } = req.user;
    const filter = role === 'faculty' ? { faculty_id: facultyId } : {};
    const entries = await Entry.find(filter);
    res.json(entries);
  },

  // CREATE (chưa có phân quyền cụ thể)
  async createEntry(req, res) {
    const entry = new Entry(req.body);
    await entry.save();
    res.json(entry);
  },

  // UPDATE (chưa có phân quyền cụ thể)
  async updateEntry(req, res) {
    const entry = await Entry.findByIdAndUpdate(req.params.id, req.body);
    res.json(entry);
  },

  // DELETE (chưa có phân quyền cụ thể)
  async deleteEntry(req, res) {
    await Entry.findByIdAndRemove(req.params.id);
    res.json({ message: 'Entry deleted' });
  },
};

module.exports = entryController;