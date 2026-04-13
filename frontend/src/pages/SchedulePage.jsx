import React, { useEffect, useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { CalendarDays, Plus, Pencil, Trash2, Clock, User } from 'lucide-react';
import { Modal, Button, EmptyState } from '../components/ui/index.jsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const defaultForm = { subject: '', instructor: '', day: 'Monday', startTime: '09:00', endTime: '10:00', color: '#7c3aed' };

export default function SchedulePage() {
  const { classes, loading, error, fetchClasses, addClass, updateClass, deleteClass } = useSchedule();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [view, setView] = useState('grid'); // 'grid' | 'list'

  useEffect(() => { fetchClasses(); }, []);

  const openAdd = () => { setEditTarget(null); setForm(defaultForm); setFormError(''); setModalOpen(true); };
  const openEdit = (cls) => {
    setEditTarget(cls);
    setForm({ subject: cls.subject, instructor: cls.instructor, day: cls.day, startTime: cls.startTime, endTime: cls.endTime, color: cls.color || '#7c3aed' });
    setFormError('');
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (formError) setFormError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.instructor.trim()) { setFormError('Subject and instructor are required'); return; }
    if (form.startTime >= form.endTime) { setFormError('End time must be after start time'); return; }
    setSaving(true);
    try {
      if (editTarget) await updateClass(editTarget._id, form);
      else await addClass(form);
      setModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save class');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteClass(deleteId); setDeleteId(null); }
    catch { /* handled silently */ }
    finally { setDeleting(false); }
  };

  // Group by day for timetable
  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = classes.filter((c) => c.day === d).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f0ff]">Class Schedule</h1>
          <p className="text-sm text-[#6b6880] mt-0.5">{classes.length} class{classes.length !== 1 ? 'es' : ''} scheduled</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex bg-[#1a1a24] border border-[#2a2a38] rounded-xl p-1 gap-1">
            <button onClick={() => setView('grid')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === 'grid' ? 'bg-violet-600 text-white' : 'text-[#6b6880] hover:text-[#f1f0ff]'}`}>Grid</button>
            <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === 'list' ? 'bg-violet-600 text-white' : 'text-[#6b6880] hover:text-[#f1f0ff]'}`}>List</button>
          </div>
          <Button onClick={openAdd}><Plus size={16} /> Add Class</Button>
        </div>
      </div>

      {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {[1,2,3,4].map((i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}
        </div>
      ) : classes.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No classes yet" description="Add your first class to start building your weekly schedule." action={<Button onClick={openAdd}><Plus size={16} /> Add Class</Button>} />
      ) : view === 'list' ? (
        /* List View */
        <div className="space-y-2">
          {DAYS.filter((d) => byDay[d].length > 0).map((day) => (
            <div key={day} className="card p-0 overflow-hidden">
              <div className="px-5 py-3 border-b border-[#2a2a38] bg-[#1a1a24]">
                <h3 className="text-xs font-semibold text-[#a09db5] uppercase tracking-wider">{day}</h3>
              </div>
              <div className="divide-y divide-[#2a2a38]">
                {byDay[day].map((cls) => (
                  <div key={cls._id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#1a1a24] transition-colors group">
                    <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: cls.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#f1f0ff]">{cls.subject}</p>
                      <p className="text-xs text-[#6b6880]">{cls.instructor}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#a09db5]">
                      <Clock size={12} /> {cls.startTime}–{cls.endTime}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(cls)} className="p-1.5 rounded-lg text-[#6b6880] hover:text-violet-400 hover:bg-violet-400/10 transition-all"><Pencil size={13} /></button>
                      <button onClick={() => setDeleteId(cls._id)} className="p-1.5 rounded-lg text-[#6b6880] hover:text-rose-400 hover:bg-rose-400/10 transition-all"><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Grid / Timetable View */
        <div className="overflow-x-auto">
          <div className="grid min-w-[700px]" style={{ gridTemplateColumns: `repeat(${DAYS.length}, 1fr)`, gap: '8px' }}>
            {DAYS.map((day) => (
              <div key={day} className="min-w-0">
                <div className="text-xs font-semibold text-[#a09db5] uppercase tracking-wider text-center mb-2 py-2 bg-[#1a1a24] rounded-lg border border-[#2a2a38]">
                  {day.slice(0, 3)}
                </div>
                <div className="space-y-2">
                  {byDay[day].length === 0 ? (
                    <div className="h-20 border border-dashed border-[#2a2a38] rounded-xl flex items-center justify-center">
                      <span className="text-xs text-[#3a3a4a]">—</span>
                    </div>
                  ) : (
                    byDay[day].map((cls) => (
                      <div key={cls._id} className="rounded-xl p-3 border border-white/5 hover:border-white/10 transition-all group cursor-default" style={{ backgroundColor: cls.color + '22' }}>
                        <p className="text-xs font-semibold text-[#f1f0ff] truncate leading-tight">{cls.subject}</p>
                        <p className="text-[10px] text-[#a09db5] mt-0.5 flex items-center gap-0.5 truncate"><User size={9} />{cls.instructor}</p>
                        <p className="text-[10px] text-[#6b6880] mt-1 flex items-center gap-0.5"><Clock size={9} />{cls.startTime}–{cls.endTime}</p>
                        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(cls)} className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors"><Pencil size={10} className="text-white" /></button>
                          <button onClick={() => setDeleteId(cls._id)} className="p-1 rounded bg-rose-500/20 hover:bg-rose-500/30 transition-colors"><Trash2 size={10} className="text-rose-300" /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Class' : 'Add New Class'}>
        <form onSubmit={handleSave} className="space-y-4">
          {formError && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-3 rounded-xl">{formError}</div>}
          <div>
            <label className="label">Subject Name</label>
            <input name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Mathematics" className="input" />
          </div>
          <div>
            <label className="label">Instructor</label>
            <input name="instructor" value={form.instructor} onChange={handleChange} placeholder="e.g. Dr. Smith" className="input" />
          </div>
          <div>
            <label className="label">Day</label>
            <select name="day" value={form.day} onChange={handleChange} className="input">
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Time</label>
              <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">End Time</label>
              <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm((p) => ({ ...p, color: c }))}
                  className={`w-7 h-7 rounded-lg border-2 transition-all ${form.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">{editTarget ? 'Update' : 'Add Class'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Class">
        <p className="text-sm text-[#a09db5] mb-5">Are you sure you want to delete this class? This action cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)} className="flex-1">Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete} className="flex-1">Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
