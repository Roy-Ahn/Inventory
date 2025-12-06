'use client';

import React, { useState } from 'react';
import { Space } from '@/types';
import Spinner from '@/components/Spinner';
import { useData } from '@/contexts/DataContext';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { supabase } from '@/lib/supabase';

const SpaceForm: React.FC<{
  space: Partial<Space> | null;
  onSave: (space: Omit<Space, 'id'> | Space) => void;
  onCancel: () => void;
}> = ({ space, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Space>>(
    space || {
      name: '', location: '', size: 0, pricePerMonth: 0, description: '', images: [], features: [], isAvailable: true,
    }
  );
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleArrayChange = (field: 'features', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value.split(',').map(item => item.trim()) }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const files = Array.from(e.target.files);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('space-images')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from('space-images')
          .getPublicUrl(filePath);

        if (data) {
          uploadedUrls.push(data.publicUrl);
        }
      }

      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Omit<Space, 'id'> | Space);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{space?.id ? 'Edit Space' : 'Create New Space'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Name" required className="p-2 border rounded-md" />
            <div className="google-places-autocomplete">
              <GooglePlacesAutocomplete
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
                selectProps={{
                  value: formData.location ? { label: formData.location, value: formData.location } : null,
                  onChange: (val: any) => setFormData(prev => ({ ...prev, location: val?.label || '' })),
                  placeholder: 'Location',
                  className: 'z-50'
                }}
              />
            </div>
            <input name="size" value={formData.size || ''} onChange={handleChange} type="number" placeholder="Size (sq ft)" required className="p-2 border rounded-md" />
            <input name="pricePerMonth" value={formData.pricePerMonth || ''} onChange={handleChange} type="number" placeholder="Price per Month" required className="p-2 border rounded-md" />
          </div>
          <textarea name="description" value={formData.description || ''} onChange={handleChange} placeholder="Description" required className="w-full p-2 border rounded-md h-24" />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Images</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.images?.map((url, index) => (
                <div key={index} className="relative w-20 h-20">
                  <img src={url} alt={`Space ${index}`} className="w-full h-full object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploading}
              className="w-full p-2 border rounded-md"
            />
            {uploading && <p className="text-sm text-blue-600">Uploading...</p>}
          </div>

          <input name="features" value={formData.features?.join(', ') || ''} onChange={(e) => handleArrayChange('features', e.target.value)} placeholder="Features (comma separated)" required className="w-full p-2 border rounded-md" />
          <div className="flex items-center">
            <input type="checkbox" id="isAvailable" name="isAvailable" checked={formData.isAvailable} onChange={e => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
            <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">Is Available</label>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AdminPage() {
  const { spaces, isLoading: loading, createSpace, updateSpace, deleteSpace } = useData();
  const [editingSpace, setEditingSpace] = useState<Partial<Space> | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleSave = async (spaceData: Omit<Space, 'id'> | Space) => {
    try {
      if ('id' in spaceData) {
        await updateSpace(spaceData);
      } else {
        await createSpace(spaceData);
      }
      setIsFormVisible(false);
      setEditingSpace(null);
    } catch (error) {
      console.error('Failed to save space:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this space?')) {
      try {
        await deleteSpace(id);
      } catch (error) {
        console.error('Failed to delete space:', error);
      }
    }
  };

  const handleAddNew = () => {
    setEditingSpace({});
    setIsFormVisible(true);
  };

  const handleEdit = (space: Space) => {
    setEditingSpace(space);
    setIsFormVisible(true);
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Inventory</h1>
        <button onClick={handleAddNew} className="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors duration-300">
          + Add New Space
        </button>
      </div>

      {isFormVisible && <SpaceForm space={editingSpace} onSave={handleSave} onCancel={() => { setIsFormVisible(false); setEditingSpace(null); }} />}

      {loading ? <Spinner /> : (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Mo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {spaces.map(space => (
                  <tr key={space.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-900">{space.name}</div><div className="text-sm text-gray-500">{space.size} sq ft</div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{space.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">${space.pricePerMonth}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${space.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {space.isAvailable ? 'Available' : 'Booked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button onClick={() => handleEdit(space)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                      <button onClick={() => handleDelete(space.id)} className="text-red-600 hover:text-red-900">Delete</button>
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

