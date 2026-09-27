import { useState } from "react";
import { Plus, Trash2, Edit2, X, MapPin } from "lucide-react";
import { dummyAddressData } from "../assets/assets";
import toast from 'react-hot-toast';

interface Address {
  _id: string;
  label: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  isDefault: boolean;
  lat: number;
  lng: number;
}

const Addresses = () => {
  const [addresses, setAddresses] = useState<Address[]>(dummyAddressData as Address[]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);

  const [formData, setFormData] = useState<Omit<Address, '_id' | 'isDefault'>>({
    label: "", fullName: "", address: "", city: "", state: "", zip: "", phone: "", lat: 40.7128, lng: -74.006
  });

  const openModal = (addr: Address | null = null) => {
    setEditingAddr(addr);
    if (addr) {
      setFormData({ label: addr.label, fullName: addr.fullName, address: addr.address, city: addr.city, state: addr.state, zip: addr.zip, phone: addr.phone, lat: addr.lat, lng: addr.lng });
    } else {
      setFormData({ label: "", fullName: "", address: "", city: "", state: "", zip: "", phone: "", lat: 40.7128, lng: -74.006 });
    }
    setIsModalOpen(true);
  };

  const saveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddr) {
      setAddresses(addresses.map(a => a._id === editingAddr._id ? { ...a, ...formData } : a));
      toast.success("Address updated!");
    } else {
      const newAddress: Address = { ...formData, _id: Date.now().toString(), isDefault: addresses.length === 0 };
      setAddresses([...addresses, newAddress]);
      toast.success("Address added!");
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
          <button onClick={() => openModal()} className="bg-[#1A2E22] text-white px-6 py-3 rounded-full font-semibold hover:bg-black transition-all shadow-lg shadow-black/10">
            <Plus size={18} className="inline mr-2" /> Add New Address
          </button>
        </div>

        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr._id} className="bg-white p-6 rounded-3xl shadow-sm border border-transparent hover:border-gray-200 transition-all flex justify-between items-start">
              <div className="flex gap-4">
                <MapPin className="text-green-700 mt-1" size={24} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-gray-900">{addr.label}</h3>
                    {addr.isDefault && (
                      <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Default</span>
                    )}
                  </div>
                  <p className="text-gray-800 font-medium">{addr.fullName}</p>
                  <p className="text-gray-500 text-sm">{addr.address}, {addr.city}, {addr.state} {addr.zip}</p>
                  <p className="text-gray-500 text-sm">{addr.phone}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openModal(addr)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 size={18} /></button>
                <button onClick={() => setAddresses(addresses.filter(a => a._id !== addr._id))} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={saveAddress} className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-3 shadow-2xl">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-xl text-gray-900">{editingAddr ? "Edit Address" : "Add Address"}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <input required placeholder="Label (e.g., Home, Work)" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#1A2E22]/20" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} />
            <input required placeholder="Full Name (e.g., John Doe)" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#1A2E22]/20" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            <input required placeholder="Address (e.g., 123 Main St)" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#1A2E22]/20" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            
            <div className="grid grid-cols-2 gap-2">
              <input required placeholder="City (e.g., New York)" className="p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#1A2E22]/20" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              <input required placeholder="State (e.g., NY)" className="p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#1A2E22]/20" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
            </div>
            
            <input required placeholder="Zip Code (e.g., 10001)" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#1A2E22]/20" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
            <input required placeholder="Phone (e.g., 555-0123)" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#1A2E22]/20" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            
            <button type="submit" className="w-full bg-[#1A2E22] text-white py-3 rounded-xl font-bold mt-2">Save Address</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Addresses;