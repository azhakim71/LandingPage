import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Globe, Code, Save, Image, Type, AlignLeft, Move } from 'lucide-react';
import { LandingPageData, LandingPageSection } from '../../types';

const LandingPageBuilder: React.FC = () => {
  const [landingPages, setLandingPages] = useState<LandingPageData[]>([
    {
      id: '1',
      title: 'মূল ল্যান্ডিং পেজ',
      slug: 'main',
      headline: 'স্মার্ট মানি সেভিং বক্স',
      subheadline: 'আপনার সঞ্চয়ের সাথী',
      ctaText: 'অর্ডার কনফার্ম করুন',
      isActive: true,
      createdAt: new Date(),
      sections: [
        {
          id: '1',
          type: 'hero',
          title: 'হিরো সেকশন',
          content: 'স্মার্ট মানি সেভিং বক্স - আপনার সঞ্চয়ের সাথী',
          order: 1,
          isActive: true
        },
        {
          id: '2',
          type: 'features',
          title: 'ফিচার সেকশন',
          content: 'আমাদের পণ্যের বিশেষ বৈশিষ্ট্য',
          order: 2,
          isActive: true
        }
      ]
    }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingPage, setEditingPage] = useState<LandingPageData | null>(null);
  const [editingSection, setEditingSection] = useState<LandingPageSection | null>(null);
  const [currentPageId, setCurrentPageId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    headline: '',
    subheadline: '',
    ctaText: '',
    headerCode: '',
    isActive: true
  });

  const [sectionFormData, setSectionFormData] = useState({
    type: 'text' as 'text' | 'image' | 'hero' | 'features' | 'testimonials' | 'cta',
    title: '',
    content: '',
    imageUrl: '',
    order: 1,
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const page: LandingPageData = {
      id: editingPage?.id || Date.now().toString(),
      title: formData.title,
      slug: formData.slug,
      headline: formData.headline,
      subheadline: formData.subheadline,
      ctaText: formData.ctaText,
      headerCode: formData.headerCode,
      isActive: formData.isActive,
      createdAt: editingPage?.createdAt || new Date(),
      sections: editingPage?.sections || []
    };

    if (editingPage) {
      setLandingPages(prev => prev.map(p => p.id === editingPage.id ? page : p));
    } else {
      setLandingPages(prev => [...prev, page]);
    }
    
    handleCloseModal();
  };

  const handleSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const section: LandingPageSection = {
      id: editingSection?.id || Date.now().toString(),
      type: sectionFormData.type,
      title: sectionFormData.title,
      content: sectionFormData.content,
      imageUrl: sectionFormData.imageUrl || undefined,
      order: sectionFormData.order,
      isActive: sectionFormData.isActive
    };

    setLandingPages(prev => prev.map(page => {
      if (page.id === currentPageId) {
        const sections = editingSection 
          ? page.sections?.map(s => s.id === editingSection.id ? section : s) || []
          : [...(page.sections || []), section];
        return { ...page, sections };
      }
      return page;
    }));
    
    handleCloseSectionModal();
  };

  const handleEdit = (page: LandingPageData) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      headline: page.headline,
      subheadline: page.subheadline,
      ctaText: page.ctaText,
      headerCode: page.headerCode || '',
      isActive: page.isActive
    });
    setShowModal(true);
  };

  const handleEditSection = (section: LandingPageSection, pageId: string) => {
    setEditingSection(section);
    setCurrentPageId(pageId);
    setSectionFormData({
      type: section.type,
      title: section.title,
      content: section.content,
      imageUrl: section.imageUrl || '',
      order: section.order,
      isActive: section.isActive
    });
    setShowSectionModal(true);
  };

  const handleAddSection = (pageId: string) => {
    setCurrentPageId(pageId);
    setEditingSection(null);
    setSectionFormData({
      type: 'text',
      title: '',
      content: '',
      imageUrl: '',
      order: 1,
      isActive: true
    });
    setShowSectionModal(true);
  };

  const handleDeleteSection = (pageId: string, sectionId: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনি এই সেকশনটি ডিলিট করতে চান?')) {
      setLandingPages(prev => prev.map(page => {
        if (page.id === pageId) {
          return { ...page, sections: page.sections?.filter(s => s.id !== sectionId) || [] };
        }
        return page;
      }));
    }
  };

  const handleDelete = (pageId: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনি এই ল্যান্ডিং পেজটি ডিলিট করতে চান?')) {
      setLandingPages(prev => prev.filter(p => p.id !== pageId));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPage(null);
    setFormData({
      title: '',
      slug: '',
      headline: '',
      subheadline: '',
      ctaText: '',
      headerCode: '',
      isActive: true
    });
  };

  const handleCloseSectionModal = () => {
    setShowSectionModal(false);
    setEditingSection(null);
    setCurrentPageId('');
    setSectionFormData({
      type: 'text',
      title: '',
      content: '',
      imageUrl: '',
      order: 1,
      isActive: true
    });
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'hero': return <Globe className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'text': return <Type className="w-4 h-4" />;
      case 'features': return <AlignLeft className="w-4 h-4" />;
      default: return <Type className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">ল্যান্ডিং পেজ বিল্ডার</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন পেজ তৈরি করুন</span>
        </button>
      </div>

      {/* Landing Pages List */}
      <div className="space-y-6">
        {landingPages.map((page) => (
          <div key={page.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{page.title}</h3>
                  <p className="text-sm text-gray-600">URL: /{page.slug}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    page.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {page.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </span>
                  <button
                    onClick={() => window.open(`/${page.slug}`, '_blank')}
                    className="text-blue-600 hover:text-blue-800"
                    title="প্রিভিউ"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(page)}
                    className="text-emerald-600 hover:text-emerald-800"
                    title="সম্পাদনা"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="text-red-600 hover:text-red-800"
                    title="ডিলিট"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-500">হেডলাইন:</span>
                  <p className="text-sm text-gray-900">{page.headline}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">সাবহেডলাইন:</span>
                  <p className="text-sm text-gray-900">{page.subheadline}</p>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900">পেজ সেকশন</h4>
                <button
                  onClick={() => handleAddSection(page.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>সেকশন যোগ করুন</span>
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {page.sections?.map((section) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getSectionIcon(section.type)}
                        <span className="text-sm font-medium text-gray-900">{section.title}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={`px-1 py-0.5 text-xs rounded ${
                          section.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {section.isActive ? 'সক্রিয়' : 'বন্ধ'}
                        </span>
                        <button
                          onClick={() => handleEditSection(section, page.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(page.id, section.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">ধরন: {section.type}</p>
                    <p className="text-xs text-gray-600 truncate">{section.content}</p>
                    <div className="text-xs text-gray-500 mt-2">অর্ডার: {section.order}</div>
                  </div>
                )) || (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    কোন সেকশন নেই। প্রথম সেকশন যোগ করুন।
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {landingPages.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">কোন ল্যান্ডিং পেজ পাওয়া যায়নি</h3>
          <p className="text-gray-600 mb-4">আপনার প্রথম ল্যান্ডিং পেজ তৈরি করুন।</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            পেজ তৈরি করুন
          </button>
        </div>
      )}

      {/* Add/Edit Landing Page Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl mx-4 w-full max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingPage ? 'ল্যান্ডিং পেজ সম্পাদনা করুন' : 'নতুন ল্যান্ডিং পেজ তৈরি করুন'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    পেজের নাম *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        title: e.target.value,
                        slug: generateSlug(e.target.value)
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  মূল হেডলাইন *
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  সাবহেডলাইন *
                </label>
                <input
                  type="text"
                  value={formData.subheadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, subheadline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CTA বাটনের টেক্সট *
                </label>
                <input
                  type="text"
                  value={formData.ctaText}
                  onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  হেডার কোড (Pixel, Tag Manager ইত্যাদি)
                </label>
                <textarea
                  value={formData.headerCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, headerCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 h-24 resize-none font-mono text-sm"
                  placeholder="<script>...</script>"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  পেজটি সক্রিয় রাখুন
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
                >
                  {editingPage ? 'আপডেট করুন' : 'তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl mx-4 w-full max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSection ? 'সেকশন সম্পাদনা করুন' : 'নতুন সেকশন যোগ করুন'}
            </h3>
            
            <form onSubmit={handleSectionSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    সেকশনের ধরন *
                  </label>
                  <select
                    value={sectionFormData.type}
                    onChange={(e) => setSectionFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="text">টেক্সট</option>
                    <option value="image">ছবি</option>
                    <option value="hero">হিরো সেকশন</option>
                    <option value="features">ফিচার</option>
                    <option value="testimonials">রিভিউ</option>
                    <option value="cta">কল টু অ্যাকশন</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    অর্ডার *
                  </label>
                  <input
                    type="number"
                    value={sectionFormData.order}
                    onChange={(e) => setSectionFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  সেকশনের শিরোনাম *
                </label>
                <input
                  type="text"
                  value={sectionFormData.title}
                  onChange={(e) => setSectionFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  কন্টেন্ট *
                </label>
                <textarea
                  value={sectionFormData.content}
                  onChange={(e) => setSectionFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 h-32 resize-none"
                  required
                />
              </div>

              {(sectionFormData.type === 'image' || sectionFormData.type === 'hero') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ছবির URL
                  </label>
                  <input
                    type="url"
                    value={sectionFormData.imageUrl}
                    onChange={(e) => setSectionFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sectionActive"
                  checked={sectionFormData.isActive}
                  onChange={(e) => setSectionFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="sectionActive" className="ml-2 block text-sm text-gray-900">
                  সেকশনটি সক্রিয় রাখুন
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseSectionModal}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
                >
                  {editingSection ? 'আপডেট করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPageBuilder;