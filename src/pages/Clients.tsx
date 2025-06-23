import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { Plus, X, Edit2, Trash2, Building2, Mail, Phone, User, FileText } from 'lucide-react';
import { Client } from '../types/client';
import { supabase } from '../lib/supabase';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [nextDisplayId, setNextDisplayId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
    responsible: '',
    vat_number: '',
    type: 'customer' as 'supplier' | 'customer'
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);

      // Generate next display ID
      const highestId = data?.reduce((max, client) => {
        const num = parseInt(client.display_id.split('-')[1]);
        return num > max ? num : max;
      }, 0) || 0;
      setNextDisplayId(`CLI-${(highestId + 1).toString().padStart(4, '0')}`);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const validateForm = () => {
    if (!formData.email.includes('@')) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const clientData = {
        ...formData,
        display_id: selectedClient?.display_id || nextDisplayId,
        user_id: user.id
      };

      if (selectedClient) {
        const { error } = await supabase
          .from('clients')
          .update({
            ...clientData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedClient.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clients')
          .insert([{
            ...clientData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      await fetchClients();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving client:', error);
      setValidationError('Failed to save client');
    }
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      address: client.address,
      email: client.email,
      phone: client.phone,
      responsible: client.responsible,
      vat_number: client.vat_number,
      type: client.type
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedClient) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', selectedClient.id);

      if (error) throw error;

      await fetchClients();
      setShowDeleteConfirmation(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error deleting client:', error);
      setValidationError('Failed to delete client');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      email: '',
      phone: '',
      responsible: '',
      vat_number: '',
      type: 'customer'
    });
    setSelectedClient(null);
    setValidationError('');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
        >
          <Plus size={20} />
          Add New Client
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : clients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Phone</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Responsible</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">VAT Number</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEdit(client)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">{client.display_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{client.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        client.type === 'customer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {client.type.charAt(0).toUpperCase() + client.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{client.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{client.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{client.responsible}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{client.vat_number}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(client);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClient(client);
                            setShowDeleteConfirmation(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No clients added yet.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-bold">
                {selectedClient ? 'Edit Client' : 'Add New Client'}
              </Dialog.Title>
              <Dialog.Close className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </Dialog.Close>
            </div>

            {validationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                {validationError}
              </div>
            )}

            <Tabs.Root defaultValue="details">
              <Tabs.List className="flex border-b mb-6">
                <Tabs.Trigger
                  value="details"
                  className="px-4 py-2 border-b-2 border-transparent data-[state=active]:border-green-600"
                >
                  Details
                </Tabs.Trigger>
                {selectedClient && (
                  <Tabs.Trigger
                    value="activity"
                    className="px-4 py-2 border-b-2 border-transparent data-[state=active]:border-green-600"
                  >
                    Activity
                  </Tabs.Trigger>
                )}
              </Tabs.List>

              <Tabs.Content value="details">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={selectedClient?.display_id || nextDisplayId}
                      className="w-full border rounded-md px-3 py-2 bg-gray-100"
                      disabled
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full border rounded-md pl-10 pr-3 py-2"
                        placeholder="Enter client name"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full border rounded-md px-3 py-2"
                      rows={3}
                      placeholder="Enter complete address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full border rounded-md pl-10 pr-3 py-2"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full border rounded-md pl-10 pr-3 py-2"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Responsible Person
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="responsible"
                        value={formData.responsible}
                        onChange={handleInputChange}
                        className="w-full border rounded-md pl-10 pr-3 py-2"
                        placeholder="Enter responsible person"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      VAT Number
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="vat_number"
                        value={formData.vat_number}
                        onChange={handleInputChange}
                        className="w-full border rounded-md pl-10 pr-3 py-2"
                        placeholder="Enter VAT number"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full border rounded-md px-3 py-2"
                    >
                      <option value="customer">Customer</option>
                      <option value="supplier">Supplier</option>
                    </select>
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="activity">
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    Activity history will be shown here
                  </div>
                </div>
              </Tabs.Content>
            </Tabs.Root>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {selectedClient ? 'Update Client' : 'Add Client'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md">
            <Dialog.Title className="text-xl font-bold mb-4">
              Confirm Delete
            </Dialog.Title>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this client? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default Clients;