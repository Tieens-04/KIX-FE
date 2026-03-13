import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../components/AdminLayout";
import {
  pageTransition,
  staggerContainer,
  staggerItem,
} from "../utils/animations";
import { storeApi } from "../services/storeApi";
import { userApi } from "../services/userApi";
import { Store, User } from "../types";
import danangData from "../utils/province";

// ======= Store Form Modal (Add / Edit + Manager assignment) =======
interface StoreFormProps {
  store?: Store | null;
  onClose: () => void;
  onSaved: () => void;
}

const StoreFormModal: React.FC<StoreFormProps> = ({
  store,
  onClose,
  onSaved,
}) => {
  const isEdit = !!store;

  // Parse existing address: "street, ward, district, Đà Nẵng"
  const parseAddress = (addr: string) => {
    if (!addr) return { street: "", district: "", ward: "" };
    const parts = addr.split(", ");
    if (parts.length >= 4) {
      return {
        street: parts.slice(0, -3).join(", "),
        ward: parts[parts.length - 3],
        district: parts[parts.length - 2],
      };
    }
    if (parts.length === 3) {
      return { street: parts[0], ward: parts[1], district: parts[2] };
    }
    return { street: addr, district: "", ward: "" };
  };

  const parsed = parseAddress(store?.address || "");
  const [name, setName] = useState(store?.name || "");
  const [street, setStreet] = useState(parsed.street);
  const [district, setDistrict] = useState(parsed.district);
  const [ward, setWard] = useState(parsed.ward);
  const [phone, setPhone] = useState(store?.phone || "");
  const [status, setStatus] = useState(store?.status || "active");
  const [managerId, setManagerId] = useState(store?.manager_id || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [managers, setManagers] = useState<User[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(true);
  const [managerSearch, setManagerSearch] = useState("");

  useEffect(() => {
    const fetchManagers = async () => {
      setLoadingManagers(true);
      try {
        const resMgr = await userApi.getAll({
          limit: 100,
          role: "store_manager",
        });
        let users = resMgr.data || [];
        const resAll = await userApi.getAll({ limit: 100 });
        const allUsers = resAll.data || [];
        const ids = new Set(users.map((u: any) => u._id || u.id));
        const others = allUsers.filter((u: any) => !ids.has(u._id || u.id));
        setManagers([...users, ...others]);
      } catch (err) {
        console.error(err);
      }
      setLoadingManagers(false);
    };
    fetchManagers();
  }, []);

  const filteredManagers = managers.filter((m) => {
    if (!managerSearch) return true;
    const q = managerSearch.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q)
    );
  });

  // Province data: districts & wards
  const districts = danangData.quan_huyen.filter((d) => d.phuong_xa.length > 0);
  const selectedDistrict = districts.find((d) => d.ten === district);
  const wards = selectedDistrict?.phuong_xa || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !street || !district || !ward) {
      setError("Tên store, địa chỉ, quận/huyện và phường/xã là bắt buộc");
      return;
    }
    const address = `${street.trim()}, ${ward}, ${district}, ${danangData.tinh}`;
    setSaving(true);
    try {
      const payload: any = {
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim() || undefined,
        status,
        manager_id: managerId || null,
      };
      if (isEdit) {
        await storeApi.update(store!.id || (store as any)._id, payload);
      } else {
        await storeApi.create(payload);
      }
      if (managerId) {
        try {
          const u = managers.find((m) => (m._id || m.id) === managerId);
          if (u && u.role !== "store_manager" && u.role !== "admin") {
            await userApi.updateRole(managerId, "store_manager");
          }
        } catch (err) {
          console.warn("Auto-role update:", err);
        }
      }
      onSaved();
    } catch (err: any) {
      setError(err?.message || "Lỗi khi lưu");
      setSaving(false);
    }
  };

  const selectedManager = managers.find((m) => (m._id || m.id) === managerId);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 40 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 md:p-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">
              {isEdit ? "Chỉnh Sửa" : "Thêm Mới"}{" "}
              <span className="text-primary">Store</span>
            </h2>
            <button
              onClick={onClose}
              className="size-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">
                Tên Store *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="VD: KIX Store Q1"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">
                Thành phố
              </label>
              <input
                value={danangData.tinh}
                disabled
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold opacity-60 cursor-not-allowed"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">
                  Quận / Huyện *
                </label>
                <select
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    setWard("");
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">-- Chọn Quận/Huyện --</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.ten}>
                      {d.ten}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">
                  Phường / Xã *
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  disabled={!district}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-40"
                >
                  <option value="">-- Chọn Phường/Xã --</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.ten}>
                      {w.ten}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">
                Số nhà, tên đường *
              </label>
              <input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="VD: 123 Nguyễn Huệ"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">
                  Số điện thoại
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0901234567"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">
                  Trạng thái
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Manager Section */}
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-[10px] font-black uppercase tracking-widest mb-3 opacity-50 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">
                  person
                </span>
                Người quản lý Store
              </label>

              {selectedManager && (
                <div className="mb-3 flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-xl">
                  <div className="size-10 bg-primary rounded-full flex items-center justify-center text-charcoal font-black text-sm">
                    {selectedManager.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black truncate">
                      {selectedManager.name || "N/A"}
                    </p>
                    <p className="text-[10px] font-bold opacity-50 truncate">
                      {selectedManager.email}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${selectedManager.role === "store_manager" ? "bg-blue-100 text-blue-600" : selectedManager.role === "admin" ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-600"}`}
                  >
                    {selectedManager.role}
                  </span>
                  <button
                    type="button"
                    onClick={() => setManagerId("")}
                    className="size-7 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200"
                  >
                    <span className="material-symbols-outlined text-sm">
                      close
                    </span>
                  </button>
                </div>
              )}

              <input
                value={managerSearch}
                onChange={(e) => setManagerSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary mb-3"
                placeholder="🔍 Tìm user theo tên / email..."
              />

              <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
                {loadingManagers ? (
                  <div className="flex justify-center py-6">
                    <motion.span
                      className="material-symbols-outlined text-primary"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      sync
                    </motion.span>
                  </div>
                ) : filteredManagers.length === 0 ? (
                  <p className="text-center py-4 text-xs font-bold opacity-40">
                    Không tìm thấy user
                  </p>
                ) : (
                  filteredManagers.map((user) => {
                    const uid = (user as any)._id || user.id;
                    const isSel = managerId === uid;
                    return (
                      <button
                        key={uid}
                        type="button"
                        onClick={() => setManagerId(isSel ? "" : uid)}
                        className={`w-full flex items-center gap-3 p-3 text-left transition-all hover:bg-gray-50 ${isSel ? "bg-primary/10" : ""}`}
                      >
                        <div
                          className={`size-8 rounded-full flex items-center justify-center text-xs font-black ${isSel ? "bg-primary text-charcoal" : "bg-gray-200 text-gray-600"}`}
                        >
                          {user.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black truncate">
                            {user.name || "N/A"}
                          </p>
                          <p className="text-[10px] font-bold opacity-40 truncate">
                            {user.email}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[8px] font-black uppercase flex-shrink-0 ${user.role === "store_manager" ? "bg-blue-100 text-blue-600" : user.role === "admin" ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-600"}`}
                        >
                          {user.role}
                        </span>
                        {isSel && (
                          <span className="material-symbols-outlined text-primary text-sm flex-shrink-0">
                            check_circle
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {managerId &&
                (() => {
                  const u = managers.find((m) => (m._id || m.id) === managerId);
                  if (u && u.role !== "store_manager" && u.role !== "admin") {
                    return (
                      <p className="mt-2 text-[10px] font-bold text-blue-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">
                          info
                        </span>
                        User này sẽ được tự động nâng role thành store_manager
                        khi lưu
                      </p>
                    );
                  }
                  return null;
                })()}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 border-2 border-charcoal rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <motion.button
                type="submit"
                disabled={saving}
                className="flex-[1.5] py-4 bg-primary text-charcoal rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-charcoal hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? (
                  <>
                    <motion.span
                      className="material-symbols-outlined text-sm"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      sync
                    </motion.span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    {isEdit ? "Cập Nhật" : "Tạo Store"}
                    <span className="material-symbols-outlined text-sm">
                      check
                    </span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ======= MAIN ADMIN DASHBOARD =======
const AdminPage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal
  const [showForm, setShowForm] = useState(false);
  const [editStore, setEditStore] = useState<Store | null>(null);
  const [deleting, setDeleting] = useState("");

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await storeApi.getAll({
        page,
        limit: 10,
        search: searchQuery || undefined,
      });
      setStores(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalCount(res.meta?.totalCount || 0);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStores();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStores();
  };

  const handleDelete = async (store: Store) => {
    const id = (store as any)._id || store.id;
    if (!id) {
      alert("Không tìm thấy ID của store");
      return;
    }
    if (!window.confirm(`Bạn muốn xóa store "${store.name}"?`)) return;
    setDeleting(id);
    try {
      await storeApi.delete(id);
      await fetchStores();
    } catch (err: any) {
      console.error("DELETE STORE ERROR:", err);
      const msg =
        err?.message || err?.error || "Lỗi không xác định khi xóa store";
      alert(`Xóa store thất bại: ${msg}`);
    }
    setDeleting("");
  };

  const handleFormSaved = () => {
    setShowForm(false);
    setEditStore(null);
    fetchStores();
  };
  const activeStores = stores.filter((s) => s.status === "active").length;
  const withManager = stores.filter((s) => s.manager).length;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <AdminLayout activeNav="Dashboard">
        {/* Header */}
        <header className="flex flex-wrap justify-between items-center gap-6 mb-12">
          <div>
            <p className="text-primary font-black tracking-[0.3em] uppercase text-xs mb-2">
              Store Network Management
            </p>
            <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase">
              Store <span className="text-primary">Dashboard</span>
            </h1>
          </div>
          <motion.button
            onClick={() => {
              setEditStore(null);
              setShowForm(true);
            }}
            className="bg-charcoal text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-charcoal transition-all shadow-xl flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="material-symbols-outlined text-lg">
              add_business
            </span>
            Thêm Store
          </motion.button>
        </header>

        {/* Stats Cards */}
        <motion.section
          className="mb-12"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl font-black tracking-tight uppercase italic">
              Network Overview
            </h2>
            <div className="h-[2px] flex-1 bg-charcoal/10"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              className="bg-white p-6 rounded-[2rem] border border-border-light"
              variants={staggerItem}
              whileHover={{ y: -4 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/20 rounded-xl text-primary">
                  <span className="material-symbols-outlined">store</span>
                </div>
                <span className="text-[10px] font-black text-green-600 bg-green-100 px-2 py-1 rounded-full uppercase tracking-widest">
                  Live
                </span>
              </div>
              <p className="text-xs font-bold opacity-50 uppercase tracking-widest mb-1">
                Tổng Stores
              </p>
              <p className="text-4xl font-black italic">{totalCount}</p>
            </motion.div>
            <motion.div
              className="bg-charcoal p-6 rounded-[2rem] text-white shadow-xl"
              variants={staggerItem}
              whileHover={{ y: -4 }}
            >
              <div className="p-3 bg-white/10 rounded-xl text-primary mb-4 w-fit">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-1">
                Đang hoạt động
              </p>
              <p className="text-4xl font-black italic text-primary">
                {activeStores}
              </p>
            </motion.div>
            <motion.div
              className="bg-white p-6 rounded-[2rem] border border-border-light"
              variants={staggerItem}
              whileHover={{ y: -4 }}
            >
              <div className="p-3 bg-blue-100 rounded-xl text-blue-600 mb-4 w-fit">
                <span className="material-symbols-outlined">person</span>
              </div>
              <p className="text-xs font-bold opacity-50 uppercase tracking-widest mb-1">
                Có quản lý
              </p>
              <p className="text-4xl font-black italic">{withManager}</p>
            </motion.div>
            <motion.div
              className="bg-primary p-6 rounded-[2rem] shadow-lg border-2 border-charcoal"
              variants={staggerItem}
              whileHover={{ y: -4 }}
            >
              <div className="p-3 bg-charcoal/10 rounded-xl text-charcoal mb-4 w-fit">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <p className="text-xs font-bold text-charcoal/60 uppercase tracking-widest mb-1">
                Chưa có quản lý
              </p>
              <p className="text-4xl font-black italic text-charcoal">
                {stores.length - withManager}
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Search */}
        <section className="mb-6">
          <form
            onSubmit={handleSearch}
            className="flex flex-wrap items-center gap-4"
          >
            <div className="relative flex-1 min-w-[200px]">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên, địa chỉ..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-border-light rounded-full text-xs font-bold focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-charcoal text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-charcoal transition-colors"
            >
              Tìm
            </button>
          </form>
        </section>

        {/* Store List */}
        <motion.section
          className="mb-12 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl font-black tracking-tight uppercase italic">
              Store Locations
            </h2>
            <div className="size-3 bg-primary rounded-full"></div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <motion.span
                className="material-symbols-outlined text-4xl text-primary"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                sync
              </motion.span>
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-border-light">
              <span className="material-symbols-outlined text-6xl opacity-20 mb-4">
                store
              </span>
              <p className="font-black uppercase tracking-widest opacity-40">
                Chưa có store nào
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-6 py-2 bg-primary text-charcoal rounded-full text-xs font-black uppercase"
              >
                + Tạo ngay
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-border-light overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-charcoal text-white">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em]">
                      Store
                    </th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em]">
                      Địa chỉ
                    </th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em]">
                      SĐT
                    </th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em]">
                      Quản lý
                    </th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-center">
                      Status
                    </th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stores.map((store) => {
                    const sid = store.id || (store as any)._id;
                    return (
                      <motion.tr
                        key={sid}
                        className="hover:bg-primary/5 transition-colors group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="size-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                              <span className="material-symbols-outlined text-lg">
                                store
                              </span>
                            </div>
                            <p className="font-black italic uppercase text-sm">
                              {store.name}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs font-bold opacity-60 max-w-[200px] truncate">
                            {store.address}
                          </p>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs font-bold opacity-60">
                            {store.phone || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {store.manager ? (
                            <div className="flex items-center gap-2">
                              <div className="size-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-black">
                                {store.manager.name?.[0]?.toUpperCase() || "?"}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-black truncate">
                                  {store.manager.name}
                                </p>
                                <p className="text-[9px] font-bold text-blue-500 truncate">
                                  {store.manager.email}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-lg flex items-center gap-1 w-fit">
                              <span className="material-symbols-outlined text-[12px]">
                                warning
                              </span>
                              Chưa có
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${store.status === "active" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}
                          >
                            {store.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button
                              onClick={() => {
                                setEditStore(store);
                                setShowForm(true);
                              }}
                              className="px-3 py-1.5 bg-primary/20 rounded-lg text-[10px] font-black uppercase hover:bg-primary transition-colors flex items-center gap-1"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                edit
                              </span>
                              Sửa
                            </motion.button>
                            <motion.button
                              onClick={() => handleDelete(store)}
                              disabled={deleting === sid}
                              className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-[10px] font-black uppercase hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center gap-1"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                delete
                              </span>
                              Xóa
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-border-light rounded-xl font-black text-xs disabled:opacity-30 hover:bg-primary/10 transition-colors"
              >
                ← Trước
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`size-9 rounded-full font-black text-xs transition-colors ${page === i + 1 ? "bg-primary text-charcoal" : "bg-white border border-border-light hover:bg-primary/10"}`}
                  >
                    {i + 1}
                  </button>
                ))}
                {totalPages > 5 && (
                  <span className="text-xs font-bold opacity-40">...</span>
                )}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white border border-border-light rounded-xl font-black text-xs disabled:opacity-30 hover:bg-primary/10 transition-colors"
              >
                Sau →
              </button>
            </div>
          )}
        </motion.section>

        {/* Modal */}
        <AnimatePresence>
          {showForm && (
            <StoreFormModal
              store={editStore}
              onClose={() => {
                setShowForm(false);
                setEditStore(null);
              }}
              onSaved={handleFormSaved}
            />
          )}
        </AnimatePresence>
      </AdminLayout>
    </motion.div>
  );
};

export default AdminPage;
