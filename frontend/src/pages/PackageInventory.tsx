import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Edit,
  Trash2,
  QrCode,
  ScanSearch,
  X,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PackageItem, NavView } from '../types';
import { fetchPackages, createPackage, updatePackage, deletePackage } from '../api';
import { StatusBadge, DemoDataBadge } from '../components/StatusBadge';

interface PackageInventoryProps {
  initialFilter?: string;
  onNavigate: (view: NavView, param?: string) => void;
}

export const PackageInventory: React.FC<PackageInventoryProps> = ({
  initialFilter = 'All Packages',
  onNavigate,
}) => {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [plasticFilter, setPlasticFilter] = useState('All');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [totalCount, setTotalCount] = useState(0);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPackageItem, setEditPackageItem] = useState<PackageItem | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<PackageItem | null>(null);

  // Add Form State
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgType, setNewPkgType] = useState('Bottle');
  const [newPkgPlastic, setNewPkgPlastic] = useState('PET');
  const [newPkgWeight, setNewPkgWeight] = useState(45.0);
  const [newPkgIntended, setNewPkgIntended] = useState('Food & Beverage');
  const [newPkgNotes, setNewPkgNotes] = useState('');

  const loadData = () => {
    setLoading(true);
    fetchPackages({
      search,
      filter_status: statusFilter,
      plastic_type: plasticFilter,
      sort_by: sortBy,
      sort_order: sortOrder,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    })
      .then((res) => {
        setPackages(res.items);
        setTotalCount(res.total);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter, plasticFilter, sortBy, sortOrder, page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPackage({
        name: newPkgName || 'Standard Reusable Asset',
        package_type: newPkgType,
        plastic_type: newPkgPlastic,
        weight_grams: Number(newPkgWeight),
        intended_use: newPkgIntended,
        notes: newPkgNotes,
      });
      setShowAddModal(false);
      setNewPkgName('');
      setNewPkgNotes('');
      loadData();
    } catch (err: any) {
      alert(`Error creating package: ${err.message}`);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPackageItem) return;
    try {
      await updatePackage(editPackageItem.id, {
        name: editPackageItem.name,
        package_type: editPackageItem.package_type,
        plastic_type: editPackageItem.plastic_type,
        intended_use: editPackageItem.intended_use,
        usage_count: editPackageItem.usage_count,
        weight_grams: editPackageItem.weight_grams,
        notes: editPackageItem.notes,
      });
      setEditPackageItem(null);
      loadData();
    } catch (err: any) {
      alert(`Error updating package: ${err.message}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      await deletePackage(deleteCandidate.id);
      setDeleteCandidate(null);
      loadData();
    } catch (err: any) {
      alert(`Error deleting package: ${err.message}`);
    }
  };

  const filterOptions = [
    'All Packages',
    'Reuse Candidates',
    'Needs Inspection',
    'Repair Assessment',
    'Recycling Assessment',
    'Recovery Pending',
    'Recovery Completed',
  ];

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#17251D]">
            Package Inventory
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Registered packaging assets, live condition ratings, and recovery destinations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Register New Package</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 shadow-subtle space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Package ID, description, or notes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Plastic Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 shrink-0">Resin:</span>
            <select
              value={plasticFilter}
              onChange={(e) => {
                setPlasticFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
            >
              <option value="All">All Resins</option>
              <option value="PET">PET (1)</option>
              <option value="HDPE">HDPE (2)</option>
              <option value="PVC">PVC (3)</option>
              <option value="LDPE">LDPE (4)</option>
              <option value="PP">PP (5)</option>
              <option value="PS">PS (6)</option>
              <option value="Other">Other (7)</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => {
                setStatusFilter(f);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
                statusFilter === f
                  ? 'bg-[#14532D] text-white font-bold shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inventory Table with Modern Responsive Guidance */}
      <div className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-subtle overflow-hidden">
        <div className="table-wrapper">
          <table className="text-left w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Package ID</th>
                <th className="py-3 px-4">Format & Name</th>
                <th className="py-3 px-4">Polymer Resin</th>
                <th className="py-3 px-4">Condition & Score</th>
                <th className="py-3 px-4">Last Inspection</th>
                <th className="py-3 px-4">Recommendation</th>
                <th className="py-3 px-4">Recovery Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {packages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No packaging records found matching your filters.
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900">{pkg.id}</span>
                        {Boolean(pkg.is_demo) && <DemoDataBadge />}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{pkg.name}</div>
                      <div className="text-[11px] text-slate-400">{pkg.package_type}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#14532D]">
                        {pkg.plastic_type}
                      </span>
                      <span className="text-slate-400 text-[11px] ml-1">
                        (#{pkg.resin_code})
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            pkg.current_score >= 75
                              ? 'text-emerald-700'
                              : pkg.current_score >= 50
                              ? 'text-amber-700'
                              : 'text-red-700'
                          }`}
                        >
                          {pkg.current_score}/100
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {pkg.current_condition}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {pkg.registration_date}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={pkg.current_recommendation} size="sm" />
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={pkg.recovery_status} size="sm" />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigate('passport', pkg.id)}
                          title="View Digital Passport & QR"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-[#14532D] hover:bg-emerald-50"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onNavigate('inspect')}
                          title="Inspect Packaging"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-[#14532D] hover:bg-emerald-50"
                        >
                          <ScanSearch className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setEditPackageItem(pkg)}
                          title="Edit Details"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteCandidate(pkg)}
                          title="Delete Package"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Showing {packages.length} of {totalCount} total assets
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={packages.length < pageSize}
              className="p-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= REGISTER MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-[#14532D]">
                Register New Packaging Asset
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Asset Name / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Returnable Beverage Bottle (500ml)"
                  value={newPkgName}
                  onChange={(e) => setNewPkgName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Package Format</label>
                  <select
                    value={newPkgType}
                    onChange={(e) => setNewPkgType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Bottle">Bottle</option>
                    <option value="Food Container">Food Container</option>
                    <option value="Storage Container">Storage Container</option>
                    <option value="Packaging Box">Packaging Box</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Polymer Resin</label>
                  <select
                    value={newPkgPlastic}
                    onChange={(e) => setNewPkgPlastic(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="PET">PET (1)</option>
                    <option value="HDPE">HDPE (2)</option>
                    <option value="PVC">PVC (3)</option>
                    <option value="LDPE">LDPE (4)</option>
                    <option value="PP">PP (5)</option>
                    <option value="PS">PS (6)</option>
                    <option value="Other">Other (7)</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tare Weight (Grams)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPkgWeight}
                    onChange={(e) => setNewPkgWeight(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Intended Application</label>
                  <select
                    value={newPkgIntended}
                    onChange={(e) => setNewPkgIntended(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Household Chemistry">Household Chemistry</option>
                    <option value="Warehouse Logistics">Warehouse Logistics</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Notes</label>
                <textarea
                  rows={2}
                  placeholder="Notes on batch or supplier..."
                  value={newPkgNotes}
                  onChange={(e) => setNewPkgNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white font-bold"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {editPackageItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-[#14532D]">
                Edit Package: {editPackageItem.id}
              </h3>
              <button
                onClick={() => setEditPackageItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editPackageItem.name}
                  onChange={(e) => setEditPackageItem({ ...editPackageItem, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Uses (Cycle Count)</label>
                  <input
                    type="number"
                    value={editPackageItem.usage_count}
                    onChange={(e) =>
                      setEditPackageItem({
                        ...editPackageItem,
                        usage_count: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Weight (Grams)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editPackageItem.weight_grams}
                    onChange={(e) =>
                      setEditPackageItem({
                        ...editPackageItem,
                        weight_grams: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editPackageItem.notes || ''}
                  onChange={(e) => setEditPackageItem({ ...editPackageItem, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditPackageItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-base text-slate-900 mb-1">
                Confirm Package Deletion
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to delete <strong>{deleteCandidate.id}</strong>? All linked inspection history will be permanently deleted.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs"
              >
                Delete Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
