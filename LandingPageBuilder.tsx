import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LandingPageBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [sections, setSections] = useState<any[]>([]);

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      axios.get(`http://localhost:5011/api/landing-pages/${id}`)
        .then(res => {
          const data = res.data;
          setTitle(data.title);
          setSlug(data.slug);
          const parsed = typeof data.sections === 'string' ? JSON.parse(data.sections) : data.sections;
          setSections(parsed || []);
        })
        .catch(err => {
          console.error('Failed to load landing page:', err);
        });
    }
  }, [id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const payload = {
      title,
      slug,
      sections: JSON.stringify(sections),
    };

    try {
      if (isEditMode) {
        await axios.put(`http://localhost:5011/api/landing-pages/${id}`, payload);
        alert('Landing Page Updated!');
      } else {
        await axios.post('http://localhost:5011/api/landing-pages', payload);
        alert('Landing Page Created!');
      }

      navigate('/admin/landing-pages');
    } catch (err) {
      console.error(err);
      alert('Failed to save landing page.');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        {isEditMode ? 'Edit' : 'Create'} Landing Page
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Slug (URL)"
          value={slug}
          onChange={e => setSlug(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />

        {/* Sections JSON Preview */}
        <textarea
          value={JSON.stringify(sections, null, 2)}
          onChange={e => {
            try {
              const parsed = JSON.parse(e.target.value);
              setSections(parsed);
            } catch {
              // ignore invalid
            }
          }}
          rows={10}
          className="w-full border px-4 py-2 rounded font-mono"
        />

        <button
          type="submit"
          className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700"
        >
          {isEditMode ? 'Update' : 'Create'} Page
        </button>
      </form>
    </div>
  );
};

export default LandingPageBuilder;
