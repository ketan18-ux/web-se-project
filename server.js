require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Serve React build (after running: cd client && npm run build)
app.use(express.static(path.join(__dirname, 'client/build')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

/* =========================
   USER SCHEMA
========================= */
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  dob: Date,
  gender: String,
  state: String,
  district: String,
  income: String,
  occupation: String,
  category: String,
  isDisabled: Boolean,
  role: { type: String, default: 'user' }
}, { timestamps: true });

/* =========================
   SCHEME SCHEMA
========================= */
const schemeSchema = new mongoose.Schema({
  title: String,
  category: String,
  shortDesc: String,
  description: String,
  eligibility: String,
  benefits: String,
  documents: String,
  applicationProcess: String,
  lastDate: Date,
  status: { type: String, default: 'active' },
  officialLink: String,
  tags: [String],
  adminApproved: { type: Boolean, default: false },
  eligibilityCriteria: {
    minAge: Number,
    maxAge: Number,
    gender: String,
    states: [String],
    incomeBelow: String,
    occupations: [String],
    categories: [String],
    disabledOnly: Boolean
  },
  createdBy: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

/* =========================
   APPLICATION SCHEMA
   officialLink is stored PER APPLICATION when approved
   so each application independently carries its own link.
   This is the fix: the server attaches the link to each
   approved application object in /api/my-applications,
   meaning multiple approved applications each retain
   their own independent officialLink and none overwrite another.
========================= */
const applicationSchema = new mongoose.Schema({
  schemeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  applicationNo: String,
  fullName: String,
  email: String,
  phone: String,
  aadhar: String,
  dob: Date,
  gender: String,
  address: String,
  state: String,
  district: String,
  pincode: String,
  income: String,
  occupation: String,
  category: String,
  isDisabled: Boolean,
  purpose: String,
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  adminNote: String,
  adminRemarks: String,
  reviewedAt: Date,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  officialLinkVisible: { type: Boolean, default: false },
  appliedAt: { type: Date, default: Date.now }
});

/* =========================
   FEEDBACK SCHEMA
========================= */
const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  userEmail: String,
  subject: String,
  message: String,
  rating: { type: Number, min: 1, max: 5 },
  category: { type: String, default: 'General' },
  status: { type: String, default: 'unread' },
  adminReply: String,
  repliedAt: Date
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Scheme = mongoose.model('Scheme', schemeSchema);
const Application = mongoose.model('Application', applicationSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);

/* =========================
   AUTH MIDDLEWARE
========================= */
function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function admin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}

/* =========================
   REGISTER
========================= */
app.post('/api/register', async (req, res) => {
  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({ ...req.body, password: hashedPassword });
    res.json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   LOGIN
========================= */
app.post('/api/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

app.put('/api/me', auth, async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }).select('-password');
  res.json(updated);
});

/* =========================
   GET SCHEMES — PUBLIC
========================= */
app.get('/api/schemes', async (req, res) => {
  const query = { status: 'active', adminApproved: true };
  if (req.query.category) query.category = req.query.category;
  if (req.query.search) query.title = { $regex: req.query.search, $options: 'i' };
  const schemes = await Scheme.find(query).select('-officialLink').sort({ createdAt: -1 });
  res.json(schemes);
});

app.get('/api/schemes/:id', async (req, res) => {
  const scheme = await Scheme.findById(req.params.id).select('-officialLink');
  res.json(scheme);
});

/* =========================
   ELIGIBILITY CHECK
========================= */
app.post('/api/schemes/check-eligibility', async (req, res) => {
  try {
    const { age, gender, state, income, occupation, category, isDisabled } = req.body;
    const schemes = await Scheme.find({ status: 'active', adminApproved: true }).select('-officialLink');
    const results = [];
    for (const scheme of schemes) {
      const c = scheme.eligibilityCriteria;
      let matched = 0, total = 0;
      const matchedPoints = [], missedPoints = [];
      total++; if (age >= (c.minAge || 0) && age <= (c.maxAge || 100)) { matched++; matchedPoints.push('Age eligible'); } else { missedPoints.push('Age not eligible'); }
      total++; if (c.gender === 'Any' || c.gender === gender) { matched++; matchedPoints.push('Gender eligible'); } else { missedPoints.push('Only for ' + c.gender); }
      total++; if (!c.states || c.states.length === 0 || c.states.includes(state)) { matched++; matchedPoints.push('State eligible'); } else { missedPoints.push('State not eligible'); }
      total++; const incomeMap = { 'Below 1L': 1, '1-3L': 2, '3-5L': 3, 'Above 5L': 4 }; if (incomeMap[income] <= incomeMap[c.incomeBelow]) { matched++; matchedPoints.push('Income criteria matched'); } else { missedPoints.push('Income too high'); }
      total++; if (!c.occupations || c.occupations.length === 0 || c.occupations.includes(occupation)) { matched++; matchedPoints.push('Occupation eligible'); } else { missedPoints.push('Occupation not eligible'); }
      total++; if (!c.categories || c.categories.length === 0 || c.categories.includes(category)) { matched++; matchedPoints.push(category + ' category eligible'); } else { missedPoints.push('Category not eligible'); }
      total++; if (!c.disabledOnly || isDisabled === true) { matched++; matchedPoints.push('Disability criteria matched'); } else { missedPoints.push('Only for disabled citizens'); }
      const matchScore = Math.round((matched / total) * 100);
      if (matchScore === 100) results.push({ scheme, matchScore, matchedPoints, missedPoints });
    }
    results.sort((a, b) => b.matchScore - a.matchScore);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   APPLY FOR SCHEME
========================= */
app.post('/api/apply/:schemeId', auth, async (req, res) => {
  try {
    const existing = await Application.findOne({ schemeId: req.params.schemeId, userId: req.user.id });
    if (existing) return res.status(400).json({ error: 'Already applied' });
    const user = await User.findById(req.user.id).select('-password');
    const applicationNo = 'APP-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const application = await Application.create({
      ...req.body,
      schemeId: req.params.schemeId,
      userId: req.user.id,
      email: user.email,
      applicationNo,
      officialLinkVisible: false,
      status: 'pending'
    });
    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   MY APPLICATIONS
   FIX: Each application gets its OWN officialLink attached
   independently from its own scheme. This means if user has
   2 approved applications for 2 different schemes, both links
   are preserved — no global variable overwrites the previous one.
========================= */
app.get('/api/my-applications', auth, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id })
      .populate({ path: 'schemeId', select: '-officialLink' })
      .sort({ appliedAt: -1 });

    // For each approved application, attach its scheme's officialLink
    // independently to that application's object — not a shared variable.
    const results = await Promise.all(applications.map(async (app) => {
      const obj = app.toObject();
      if (app.status === 'approved' && app.officialLinkVisible) {
        // Fetch THIS application's scheme link separately
        const scheme = await Scheme.findById(app.schemeId?._id).select('officialLink');
        obj.officialLink = scheme?.officialLink || null;
      } else {
        obj.officialLink = null; // explicitly null for non-approved
      }
      return obj;
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   FEEDBACK
========================= */
app.post('/api/feedback', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const feedback = await Feedback.create({
      userId: req.user.id,
      userName: user.name,
      userEmail: user.email,
      subject: req.body.subject,
      message: req.body.message,
      rating: req.body.rating,
      category: req.body.category || 'General'
    });
    res.json({ message: 'Feedback submitted successfully', feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/my-feedback', auth, async (req, res) => {
  const feedbacks = await Feedback.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(feedbacks);
});

app.get('/api/admin/feedback', auth, admin, async (req, res) => {
  const feedbacks = await Feedback.find().sort({ createdAt: -1 });
  res.json(feedbacks);
});

app.patch('/api/admin/feedback/:id', auth, admin, async (req, res) => {
  const updated = await Feedback.findByIdAndUpdate(
    req.params.id,
    { adminReply: req.body.adminReply, status: 'read', repliedAt: new Date() },
    { new: true }
  );
  res.json(updated);
});

app.get('/api/admin/feedback-stats', auth, admin, async (req, res) => {
  const total = await Feedback.countDocuments();
  const unread = await Feedback.countDocuments({ status: 'unread' });
  const avgRatingResult = await Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]);
  const avgRating = avgRatingResult[0]?.avg?.toFixed(1) || 0;
  res.json({ total, unread, avgRating });
});

/* =========================
   ADMIN STATS
========================= */
app.get('/api/admin/stats', auth, admin, async (req, res) => {
  const totalSchemes = await Scheme.countDocuments();
  const activeSchemes = await Scheme.countDocuments({ status: 'active' });
  const approvedSchemes = await Scheme.countDocuments({ adminApproved: true });
  const totalApplications = await Application.countDocuments();
  const pendingApplications = await Application.countDocuments({ status: 'pending' });
  const approvedApplications = await Application.countDocuments({ status: 'approved' });
  const rejectedApplications = await Application.countDocuments({ status: 'rejected' });
  const totalUsers = await User.countDocuments({ role: 'user' });
  const unreadFeedback = await Feedback.countDocuments({ status: 'unread' });
  res.json({
    totalSchemes, activeSchemes, approvedSchemes,
    totalApplications, pendingApplications, approvedApplications, rejectedApplications,
    totalUsers, unreadFeedback
  });
});

/* =========================
   ADMIN SCHEMES
========================= */
app.get('/api/admin/schemes', auth, admin, async (req, res) => {
  const schemes = await Scheme.find().sort({ createdAt: -1 });
  res.json(schemes);
});

app.post('/api/admin/schemes', auth, admin, async (req, res) => {
  const scheme = await Scheme.create({ ...req.body, createdBy: req.user.id });
  res.json(scheme);
});

app.put('/api/admin/schemes/:id', auth, admin, async (req, res) => {
  const updated = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.patch('/api/admin/schemes/:id/approve', auth, admin, async (req, res) => {
  const updated = await Scheme.findByIdAndUpdate(
    req.params.id,
    { adminApproved: req.body.adminApproved },
    { new: true }
  );
  res.json(updated);
});

app.delete('/api/admin/schemes/:id', auth, admin, async (req, res) => {
  await Scheme.findByIdAndDelete(req.params.id);
  res.json({ message: 'Scheme deleted' });
});

/* =========================
   ADMIN APPLICATIONS
========================= */
app.get('/api/admin/applications', auth, admin, async (req, res) => {
  try {
    let query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.search) {
      query.$or = [
        { fullName: { $regex: req.query.search, $options: 'i' } },
        { applicationNo: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    const applications = await Application.find(query)
      .populate('schemeId')
      .populate('userId', '-password')
      .sort({ appliedAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/applications/:id', auth, admin, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('schemeId')
      .populate('userId', '-password');
    if (!application) return res.status(404).json({ error: 'Not found' });
    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* PATCH: approve/reject — sets officialLinkVisible = true only on approval */
app.patch('/api/admin/applications/:id', auth, admin, async (req, res) => {
  try {
    const { status, adminNote, adminRemarks } = req.body;
    const officialLinkVisible = status === 'approved';
    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNote: adminNote || adminRemarks,
        adminRemarks: adminRemarks || adminNote,
        reviewedAt: new Date(),
        reviewedBy: req.user.id,
        officialLinkVisible
      },
      { new: true }
    ).populate('schemeId').populate('userId', '-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ADMIN USERS
========================= */
app.get('/api/admin/users', auth, admin, async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

/* =========================
   SEED DATA
========================= */
app.get('/api/seed', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) return res.json({ message: 'Already seeded' });
    const hash = await bcrypt.hash('Admin123', 10);
    await User.create({ name: 'Portal Admin', email: 'admin@gov.in', password: hash, role: 'admin' });

    await Scheme.insertMany([
      { title: 'PM Kisan Samman Nidhi', category: 'Agriculture', shortDesc: 'Income support scheme for small and marginal farmers.', description: 'PM Kisan provides direct income support to eligible farmers across India.', eligibility: 'Farmers above 18 years with annual income below 3 lakh.', benefits: '₹6000 yearly financial assistance.', documents: 'Aadhar, land records, bank passbook.', applicationProcess: 'Apply through PM Kisan portal.', officialLink: 'https://pmkisan.gov.in', status: 'active', adminApproved: true, tags: ['farmer', 'agriculture', 'income-support'], eligibilityCriteria: { minAge: 18, maxAge: 70, gender: 'Any', states: [], incomeBelow: '3-5L', occupations: ['Farmer'], categories: ['General', 'OBC', 'SC', 'ST'], disabledOnly: false } },
      { title: 'Organic Farming Support Scheme', category: 'Agriculture', shortDesc: 'Support for farmers shifting to organic farming.', description: 'Financial and training support for organic cultivation.', eligibility: 'Farmers with income below 5 lakh.', benefits: 'Subsidy on organic fertilizers and training.', documents: 'Aadhar, farmer ID, bank account.', applicationProcess: 'Apply via agriculture department.', officialLink: 'https://agricoop.gov.in', status: 'active', adminApproved: true, tags: ['farmer', 'organic', 'subsidy'], eligibilityCriteria: { minAge: 21, maxAge: 65, gender: 'Any', states: [], incomeBelow: 'Above 5L', occupations: ['Farmer'], categories: ['OBC', 'SC', 'ST'], disabledOnly: false } },
      { title: 'National Scholarship Portal', category: 'Education', shortDesc: 'Scholarships for students across India.', description: 'Scholarships for eligible students pursuing education.', eligibility: 'Students aged 10-25 with family income below 3 lakh.', benefits: 'Scholarship amount directly credited.', documents: 'Student ID, income certificate, caste certificate.', applicationProcess: 'Apply online through NSP portal.', officialLink: 'https://scholarships.gov.in', status: 'active', adminApproved: true, tags: ['student', 'scholarship', 'education'], eligibilityCriteria: { minAge: 10, maxAge: 25, gender: 'Male', states: [], incomeBelow: '3-5L', occupations: ['Student'], categories: ['OBC', 'SC', 'ST'], disabledOnly: false } },
      { title: 'Merit Scholarship for Girls', category: 'Education', shortDesc: 'Scholarship scheme exclusively for girl students.', description: 'Encouraging higher education among girls.', eligibility: 'Female students below 25 years.', benefits: '₹25,000 annual scholarship.', documents: 'School ID, income certificate, bank account.', applicationProcess: 'Apply online through education portal.', officialLink: 'https://education.gov.in', status: 'active', adminApproved: true, tags: ['female', 'student', 'girls-scholarship'], eligibilityCriteria: { minAge: 12, maxAge: 25, gender: 'Female', states: [], incomeBelow: '1-3L', occupations: ['Student'], categories: ['General', 'OBC', 'SC', 'ST'], disabledOnly: false } },
      { title: 'Ayushman Bharat PM-JAY', category: 'Health', shortDesc: 'Health insurance for low income families.', description: 'Free healthcare coverage for poor families.', eligibility: 'Low income families belonging to eligible categories.', benefits: '₹5 lakh health coverage.', documents: 'Aadhar, ration card.', applicationProcess: 'Register through PMJAY portal.', officialLink: 'https://pmjay.gov.in', status: 'active', adminApproved: true, tags: ['health', 'insurance', 'bpl'], eligibilityCriteria: { minAge: 1, maxAge: 80, gender: 'Any', states: [], incomeBelow: '3-5L', occupations: [], categories: ['OBC', 'SC', 'ST'], disabledOnly: false } },
      { title: 'Senior Citizen Health Assistance', category: 'Health', shortDesc: 'Medical assistance for senior citizens.', description: 'Healthcare support for elderly citizens.', eligibility: 'Citizens above 60 years.', benefits: 'Discounted treatment and medicines.', documents: 'Aadhar, age proof.', applicationProcess: 'Apply via district hospital.', officialLink: 'https://health.gov.in', status: 'active', adminApproved: true, tags: ['senior', 'health'], eligibilityCriteria: { minAge: 60, maxAge: 100, gender: 'Any', states: [], incomeBelow: 'Above 5L', occupations: [], categories: ['General', 'OBC', 'SC', 'ST'], disabledOnly: false } },
      { title: 'PM Awas Yojana Urban', category: 'Housing', shortDesc: 'Affordable housing for urban poor.', description: 'Housing subsidy scheme for economically weaker sections.', eligibility: 'Low income urban families.', benefits: 'Subsidy on housing loans.', documents: 'Income proof, address proof.', applicationProcess: 'Apply through PMAY portal.', officialLink: 'https://pmaymis.gov.in', status: 'active', adminApproved: true, tags: ['housing', 'urban'], eligibilityCriteria: { minAge: 18, maxAge: 70, gender: 'Any', states: [], incomeBelow: '3-5L', occupations: [], categories: ['General', 'OBC', 'SC', 'ST'], disabledOnly: false } },
      { title: 'Mudra Yojana', category: 'Employment', shortDesc: 'Business loans for small entrepreneurs.', description: 'Financial support for startups and businesses.', eligibility: 'Self-employed or unemployed citizens.', benefits: 'Collateral-free business loans.', documents: 'Aadhar, PAN, business proposal.', applicationProcess: 'Apply through banks.', officialLink: 'https://mudra.org.in', status: 'active', adminApproved: true, tags: ['loan', 'business'], eligibilityCriteria: { minAge: 18, maxAge: 65, gender: 'Any', states: [], incomeBelow: 'Above 5L', occupations: ['Self-Employed', 'Unemployed'], categories: ['General', 'OBC', 'SC', 'ST'], disabledOnly: false } },
      { title: 'Sukanya Samriddhi Yojana', category: 'Women', shortDesc: 'Savings scheme for girl child.', description: 'Savings scheme encouraging education and welfare of girls.', eligibility: 'Girls below 10 years.', benefits: 'High interest savings account.', documents: 'Birth certificate, Aadhar.', applicationProcess: 'Open account in bank/post office.', officialLink: 'https://www.indiapost.gov.in', status: 'active', adminApproved: true, tags: ['girl-child', 'women'], eligibilityCriteria: { minAge: 1, maxAge: 10, gender: 'Female', states: [], incomeBelow: 'Above 5L', occupations: [], categories: ['General', 'OBC', 'SC', 'ST'], disabledOnly: false } },
      { title: 'Indira Gandhi National Disability Pension', category: 'Disability', shortDesc: 'Pension scheme for differently abled citizens.', description: 'Monthly pension support for disabled citizens.', eligibility: 'Differently abled citizens with low income.', benefits: 'Monthly pension support.', documents: 'Disability certificate, Aadhar.', applicationProcess: 'Apply through social welfare department.', officialLink: 'https://nsap.nic.in', status: 'active', adminApproved: true, tags: ['disabled', 'pension'], eligibilityCriteria: { minAge: 18, maxAge: 80, gender: 'Any', states: [], incomeBelow: 'Below 1L', occupations: [], categories: ['General', 'OBC', 'SC', 'ST'], disabledOnly: true } },
    ]);

    res.json({ message: 'Seed completed', admin: { email: 'admin@gov.in', password: 'Admin123' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   REACT FRONTEND — catch-all
   Must come AFTER all /api routes
========================= */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});