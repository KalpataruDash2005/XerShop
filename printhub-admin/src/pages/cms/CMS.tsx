import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Image, FileText } from 'lucide-react';

// Mock data
const mockBanners = [
  { id: 1, title: 'Summer Sale', imageUrl: '', link: '/offers', active: true, createdAt: '2024-01-10' },
  { id: 2, title: 'Free Delivery', imageUrl: '', link: '/delivery', active: true, createdAt: '2024-01-12' },
];

const mockPages = [
  { id: 1, title: 'Terms of Service', slug: 'terms', updatedAt: '2024-01-10' },
  { id: 2, title: 'Privacy Policy', slug: 'privacy', updatedAt: '2024-01-12' },
  { id: 3, title: 'About Us', slug: 'about', updatedAt: '2024-01-15' },
  { id: 4, title: 'FAQ', slug: 'faq', updatedAt: '2024-01-18' },
];

export default function CMS() {
  const [activeTab, setActiveTab] = useState<'banners' | 'pages'>('banners');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CMS</h1>
          <p className="text-slate-500 mt-1">Manage banners and pages</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'banners'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('banners')}
        >
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Banners
          </div>
        </button>
        <button
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'pages'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('pages')}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Pages
          </div>
        </button>
      </div>

      {/* Banners Tab */}
      {activeTab === 'banners' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="btn-primary">
              <Plus className="w-4 h-4" />
              Add Banner
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockBanners.map((banner) => (
              <div key={banner.id} className="card overflow-hidden">
                <div className="aspect-video bg-slate-100 flex items-center justify-center">
                  <Image className="w-12 h-12 text-slate-300" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900">{banner.title}</h3>
                      <p className="text-sm text-slate-500">{banner.link}</p>
                    </div>
                    <span className={`badge ${banner.active ? 'badge-success' : 'badge-default'}`}>
                      {banner.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <button className="btn-outline text-sm py-1.5">
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button className="btn-outline text-sm py-1.5 text-red-600 hover:bg-red-50">
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pages Tab */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="btn-primary">
              <Plus className="w-4 h-4" />
              Add Page
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockPages.map((page) => (
                  <tr key={page.id}>
                    <td className="font-medium">{page.title}</td>
                    <td className="font-mono text-slate-500">/{page.slug}</td>
                    <td className="text-slate-500">{page.updatedAt}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
