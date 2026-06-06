import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, INDIAN_STATES } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import AdminSidebar from '../../components/AdminSidebar';

const CATEGORIES = ['Agriculture', 'Education', 'Health', 'Housing', 'Employment', 'Women', 'Disability'];
const OCCUPATIONS = ['Farmer', 'Student', 'Unemployed', 'Salaried', 'Self-Employed', 'Other'];
const CATEGORIES_CASTE = ['General', 'OBC', 'SC', 'ST'];

export default function AdminAddScheme() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '', category: 'Agriculture', shortDesc: '', description: '',
    eligibility: '', benefits: '', documents: '', applicationProcess: '',
    officialLink: '', lastDate: '', status: 'active', adminApproved: true,
    tags: '',
    eligibilityCriteria: {
      minAge: '', maxAge: '', gender: 'Any',
      states: [], incomeBelow: 'Above 5L',
      occupations: [], categories: [],
      disabledOnly: false,
    },
  });

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const setCriteria = k => e => setForm(p => ({
    ...p,
    eligibilityCriteria: { ...p.eligibilityCriteria, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value },
  }));

  const toggleMulti = (field, val) => {
    setForm(p => {
      const arr = p.eligibilityCriteria[field];
      const updated = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
      return { ...p, eligibilityCriteria: { ...p.eligibilityCriteria, [field]: updated } };
    });
  };

  const submit = async () => {
    if (!form.title || !form.category) { toast('error', 'Required', 'Title and category are required.'); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        eligibilityCriteria: {
          ...form.eligibilityCriteria,
          minAge: parseInt(form.eligibilityCriteria.minAge) || 0,
          maxAge: parseInt(form.eligibilityCriteria.maxAge) || 100,
        },
      };
      await apiFetch('/admin/schemes', { method: 'POST', body: JSON.stringify(payload) });
      toast('success', 'Scheme Created!', form.title);
      navigate('/admin/schemes');
    } catch (err) { toast('error', 'Failed', err.message); }
    finally { setLoading(false); }
  };

  const ChipSelector = ({ options, field }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
      {options.map(o => {
        const sel = form.eligibilityCriteria[field].includes(o);
        return (
          <button key={o} type="button"
            className={`btn btn-sm ${sel ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => toggleMulti(field, o)}>
            {sel ? '✓ ' : ''}{o}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="ashoka-stripe" />
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/schemes')}>← Back</button>
            <div>
              <h1>Add New Scheme</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Create a new government welfare scheme</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Left Column */}
            <div>
              <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ marginBottom: 20 }}>Basic Information</h3>
                <div className="form-group">
                  <label>Scheme Title *</label>
                  <input placeholder="e.g. PM Kisan Samman Nidhi" value={form.title} onChange={set('title')} />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select value={form.category} onChange={set('category')}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Short Description</label>
                  <input placeholder="One-line summary" value={form.shortDesc} onChange={set('shortDesc')} />
                </div>
                <div className="form-group">
                  <label>Full Description</label>
                  <textarea style={{ minHeight: 90 }} value={form.description} onChange={set('description')} />
                </div>
                <div className="form-group">
                  <label>Eligibility</label>
                  <textarea style={{ minHeight: 70 }} value={form.eligibility} onChange={set('eligibility')} />
                </div>
                <div className="form-group">
                  <label>Benefits</label>
                  <textarea style={{ minHeight: 70 }} value={form.benefits} onChange={set('benefits')} />
                </div>
                <div className="form-group">
                  <label>Required Documents</label>
                  <input placeholder="Aadhar, PAN, etc." value={form.documents} onChange={set('documents')} />
                </div>
                <div className="form-group">
                  <label>Application Process</label>
                  <textarea style={{ minHeight: 60 }} value={form.applicationProcess} onChange={set('applicationProcess')} />
                </div>
                <div className="form-group">
                  <label>Official Link (Portal URL)</label>
                  <input type="url" placeholder="https://..." value={form.officialLink} onChange={set('officialLink')} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Last Date</label>
                    <input type="date" value={form.lastDate} onChange={set('lastDate')} />
                  </div>
                  <div className="form-group">
                    <label>Tags (comma separated)</label>
                    <input placeholder="farmer, subsidy" value={form.tags} onChange={set('tags')} />
                  </div>
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.adminApproved}
                      onChange={e => setForm(p => ({ ...p, adminApproved: e.target.checked }))}
                      style={{ width: 'auto' }} />
                    Approve immediately (visible to users)
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column — Eligibility Criteria */}
            <div>
              <div className="card">
                <h3 style={{ marginBottom: 20 }}>Eligibility Criteria</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Min Age</label>
                    <input type="number" placeholder="0" value={form.eligibilityCriteria.minAge} onChange={setCriteria('minAge')} />
                  </div>
                  <div className="form-group">
                    <label>Max Age</label>
                    <input type="number" placeholder="100" value={form.eligibilityCriteria.maxAge} onChange={setCriteria('maxAge')} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select value={form.eligibilityCriteria.gender} onChange={setCriteria('gender')}>
                    <option>Any</option><option>Male</option><option>Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Income Below</label>
                  <select value={form.eligibilityCriteria.incomeBelow} onChange={setCriteria('incomeBelow')}>
                    <option>Below 1L</option><option>1-3L</option><option>3-5L</option><option>Above 5L</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Eligible Occupations (select all that apply)</label>
                  <ChipSelector options={OCCUPATIONS} field="occupations" />
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Leave empty = all occupations eligible</div>
                </div>
                <div className="form-group">
                  <label>Eligible Categories</label>
                  <ChipSelector options={CATEGORIES_CASTE} field="categories" />
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Leave empty = all categories eligible</div>
                </div>
                <div className="form-group">
                  <label>Eligible States (leave empty = all states)</label>
                  <div style={{ maxHeight: 160, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {INDIAN_STATES.map(s => {
                      const sel = form.eligibilityCriteria.states.includes(s);
                      return (
                        <button key={s} type="button"
                          className={`btn btn-sm ${sel ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '3px 10px', fontSize: 11 }}
                          onClick={() => toggleMulti('states', s)}>
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.eligibilityCriteria.disabledOnly}
                      onChange={e => setForm(p => ({ ...p, eligibilityCriteria: { ...p.eligibilityCriteria, disabledOnly: e.target.checked } }))}
                      style={{ width: 'auto' }} />
                    Only for differently abled citizens
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary" onClick={() => navigate('/admin/schemes')}>Cancel</button>
            <button className="btn btn-primary btn-lg" onClick={submit} disabled={loading}>
              {loading ? 'Creating…' : '✅ Create Scheme'}
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
