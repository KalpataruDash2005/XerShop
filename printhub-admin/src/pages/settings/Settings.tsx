import { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [settings, setSettings] = useState({
    siteName: 'PrintHub',
    supportEmail: 'support@printhub.com',
    supportPhone: '+91 9876543210',
    minOrderAmount: '50',
    deliveryCharge: '30',
    freeDeliveryAbove: '500',
    taxRate: '18',
    referralBonus: '100',
    walletMinRecharge: '100',
    walletMaxRecharge: '10000',
  });

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 mt-1">Configure platform settings</p>
        </div>
        <button className="btn-primary" onClick={handleSave}>
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Site Name</label>
              <input
                type="text"
                className="input"
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Support Email</label>
              <input
                type="email"
                className="input"
                value={settings.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Support Phone</label>
              <input
                type="tel"
                className="input"
                value={settings.supportPhone}
                onChange={(e) => handleChange('supportPhone', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Order Settings */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Order Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Minimum Order Amount (₹)</label>
              <input
                type="number"
                className="input"
                value={settings.minOrderAmount}
                onChange={(e) => handleChange('minOrderAmount', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Delivery Charge (₹)</label>
              <input
                type="number"
                className="input"
                value={settings.deliveryCharge}
                onChange={(e) => handleChange('deliveryCharge', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Free Delivery Above (₹)</label>
              <input
                type="number"
                className="input"
                value={settings.freeDeliveryAbove}
                onChange={(e) => handleChange('freeDeliveryAbove', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Tax Rate (%)</label>
              <input
                type="number"
                className="input"
                value={settings.taxRate}
                onChange={(e) => handleChange('taxRate', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Referral & Wallet */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Referral & Wallet</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Referral Bonus (₹)</label>
              <input
                type="number"
                className="input"
                value={settings.referralBonus}
                onChange={(e) => handleChange('referralBonus', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Wallet Min Recharge (₹)</label>
              <input
                type="number"
                className="input"
                value={settings.walletMinRecharge}
                onChange={(e) => handleChange('walletMinRecharge', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Wallet Max Recharge (₹)</label>
              <input
                type="number"
                className="input"
                value={settings.walletMaxRecharge}
                onChange={(e) => handleChange('walletMaxRecharge', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">API Server</span>
              <span className="badge badge-success">Online</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Database</span>
              <span className="badge badge-success">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Redis Cache</span>
              <span className="badge badge-success">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Payment Gateway</span>
              <span className="badge badge-success">Configured</span>
            </div>
          </div>

          <button className="btn-outline w-full mt-4">
            <RefreshCw className="w-4 h-4" />
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
}
