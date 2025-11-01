import React, { useState, useEffect, useCallback } from 'react';
import { getSpaces, createSpace, updateSpace, deleteSpace } from '../services/storageService';
import { Space } from '../types';
import Spinner from '../components/Spinner';

const SpaceForm: React.FC<{
  space: Partial<Space> | null;
  onSave: (space: Omit<Space, 'id'> | Space) => void;
  onCancel: () => void;
}> = ({ space, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Space>>(
    space || {
      name: '', location: '', size: 0, pricePerMonth: 0, description: '', images: [''], features: [''], isAvailable: true,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };
  
  const handleArrayChange = (field: 'images' | 'features', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value.split(',').map(item => item.trim()) }));
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
            <input name="location" value={formData.location || ''} onChange={handleChange} placeholder="Location" required className="p-2 border rounded-md" />
            <input name="size" value={formData.size || ''} onChange={handleChange} type="number" placeholder="Size (sq ft)" required className="p-2 border rounded-md" />
            <input name="pricePerMonth" value={formData.pricePerMonth || ''} onChange={handleChange} type="number" placeholder="Price per Month" required className="p-2 border rounded-md" />
          </div>
          <textarea name="description" value={formData.description || ''} onChange={handleChange} placeholder="Description" required className="w-full p-2 border rounded-md h-24" />
          <input name="images" value={formData.images?.join(', ') || ''} onChange={(e) => handleArrayChange('images', e.target.value)} placeholder="Image URLs (comma separated)" required className="w-full p-2 border rounded-md" />
          <input name="features" value={formData.features?.join(', ') || ''} onChange={(e) => handleArrayChange('features', e.target.value)} placeholder="Features (comma separated)" required className="w-full p-2 border rounded-md" />
           <div className="flex items-center">
            <input type="checkbox" id="isAvailable" name="isAvailable" checked={formData.isAvailable} onChange={e => setFormData(prev => ({...prev, isAvailable: e.target.checked}))} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
            <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">Is Available</label>
           </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const AdminPage: React.FC = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSpace, setEditingSpace] = useState<Partial<Space> | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const fetchSpaces = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSpaces();
      setSpaces(data);
    } catch (error) {
      console.error("Failed to fetch spaces:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  const handleSave = async (spaceData: Omit<Space, 'id'> | Space) => {
    if ('id' in spaceData) {
      await updateSpace(spaceData);
    } else {
      await createSpace(spaceData);
    }
    setIsFormVisible(false);
    setEditingSpace(null);
    fetchSpaces();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this space?')) {
      await deleteSpace(id);
      fetchSpaces();
    }
  };

  const handleAddNew = () => {
    setEditingSpace({});
    setIsFormVisible(true);
  };
  
  const handleEdit = (space: Space) => {
    setEditingSpace(space);
    setIsFormVisible(true);
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Inventory</h1>
        <button onClick={handleAddNew} className="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors duration-300">
          + Add New Space
        </button>
      </div>
      
      {isFormVisible && <SpaceForm space={editingSpace} onSave={handleSave} onCancel={() => {setIsFormVisible(false); setEditingSpace(null);}} />}

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
};

export default AdminPage;