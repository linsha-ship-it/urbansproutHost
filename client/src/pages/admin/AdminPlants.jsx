import React, { useEffect, useMemo, useState } from 'react';
import { apiCall } from '../../utils/api';

const AdminPlants = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    plantName: '',
    imageUrl: '',
    description: '',
    benefits: '',
    daysToGrow: '',
    maintenance: '',
    sunlight: '',
    space: '',
    experience: '',
    time: '',
    goal: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchPlants = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pageNum.toString(), limit: limit.toString() });
      if (search) params.set('search', search);
      const res = await apiCall(`/plants?${params.toString()}`);
      if (res.success && res.data) {
        setPlants(res.data.plants);
        setTotal(res.data.pagination.total);
        setPage(res.data.pagination.page);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlants(1); }, [limit]);

  const submitForm = async (e) => {
    e.preventDefault();
    const payload = {
      plantName: form.plantName.trim(),
      imageUrl: form.imageUrl.trim(),
      description: form.description.trim(),
      benefits: form.benefits.trim(),
      daysToGrow: Number(form.daysToGrow),
      maintenance: form.maintenance.trim(),
      sunlight: form.sunlight.trim(),
      space: form.space.trim(),
      experience: form.experience.trim(),
      time: form.time.trim(),
      goal: form.goal.trim(),
    };
    const endpoint = editingId ? `/admin/plants/${editingId}` : '/admin/plants';
    const method = editingId ? 'PUT' : 'POST';
    const res = await apiCall(endpoint, { method, body: JSON.stringify(payload) });
    if (res.success) {
      setForm({ plantName: '', imageUrl: '', description: '', benefits: '', daysToGrow: '', maintenance: '', sunlight: '', space: '', experience: '', time: '', goal: '' });
      setEditingId(null);
      fetchPlants(page);
      alert(editingId ? 'Plant updated' : 'Plant created');
    }
  };

  const editPlant = (plant) => {
    setEditingId(plant._id);
    setForm({
      plantName: plant.plantName || '',
      imageUrl: plant.imageUrl || '',
      description: plant.description || '',
      benefits: plant.benefits || '',
      daysToGrow: plant.daysToGrow?.toString() || '',
      maintenance: plant.maintenance || '',
      sunlight: plant.sunlight || '',
      space: plant.space || '',
      experience: plant.experience || '',
      time: plant.time || '',
      goal: plant.goal || ''
    });
  };

  const onBulkUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiCall('/admin/plants/upload', { method: 'POST', body: fd });
      if (res.success) {
        alert(`Uploaded: ${res.data.processed} rows${res.data.errors ? `, ${res.data.errors} errors` : ''}`);
        fetchPlants(1);
      }
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const downloadCsvTemplate = () => {
    const headers = [
      'plantName',
      'imageUrl',
      'description',
      'benefits',
      'daysToGrow',
      'maintenance',
      'sunlight',
      'space',
      'experience',
      'time',
      'goal'
    ];
    const example = [
      'Basil','https://example.com/basil.jpg','Aromatic herb for cooking','Culinary, aromatic','30','Easy','full_sun','small','beginner','low','food'
    ];
    const csv = `${headers.join(',')}\n${example.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plants_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Plants</h2>
        <div className="flex items-center gap-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="border rounded px-3 py-2" />
          <button onClick={() => fetchPlants(1)} className="px-3 py-2 bg-green-600 text-white rounded">Search</button>
          <button type="button" onClick={downloadCsvTemplate} className="px-3 py-2 bg-gray-100 rounded border">Download CSV Template</button>
          <label className="px-3 py-2 bg-blue-600 text-white rounded cursor-pointer">
            {uploading ? 'Uploading...' : 'Bulk Upload CSV/JSON'}
            <input type="file" accept=".csv,.json" onChange={onBulkUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
      </div>

      <form onSubmit={submitForm} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Object.entries(form).map(([key, value]) => (
          <input
            key={key}
            value={value}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            placeholder={key}
            className="border rounded px-3 py-2"
          />
        ))}
        <div className="md:col-span-2 flex gap-3">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            {editingId ? 'Update' : 'Create'}
          </button>
          {editingId && (
            <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => { setEditingId(null); setForm({ plantName: '', imageUrl: '', description: '', benefits: '', daysToGrow: '', maintenance: '', sunlight: '', space: '', experience: '', time: '', goal: '' }); }}>Cancel</button>
          )}
        </div>
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Image</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Sunlight</th>
                <th className="py-2 pr-4">Experience</th>
                <th className="py-2 pr-4">Days</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plants.map((p) => (
                <tr key={p._id} className="border-b">
                  <td className="py-2 pr-4"><img src={p.imageUrl} alt={p.plantName} className="w-12 h-12 object-cover rounded" /></td>
                  <td className="py-2 pr-4">{p.plantName}</td>
                  <td className="py-2 pr-4">{p.sunlight}</td>
                  <td className="py-2 pr-4">{p.experience}</td>
                  <td className="py-2 pr-4">{p.daysToGrow}</td>
                  <td className="py-2 pr-4">
                    <button className="px-3 py-1 bg-gray-100 rounded mr-2" onClick={() => editPlant(p)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div>Page {page} of {totalPages}</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => fetchPlants(page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
          <button disabled={page >= totalPages} onClick={() => fetchPlants(page + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPlants;


