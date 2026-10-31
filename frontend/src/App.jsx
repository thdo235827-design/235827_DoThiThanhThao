
import { useEffect, useState } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  Monitor,
  Search,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Package,
  Wrench,
  AlertTriangle,
  CheckCircle,
  X,
  Save
} from "lucide-react";
import "./App.css";

const API_URL = "/api/devices";

const INITIAL_FORM = {
  deviceId: "",
  name: "",
  deviceType: "",
  room: "",
  brand: "",
  model: "",
  quantity: 1,
  status: "Đang sử dụng",
  purchaseDate: "",
  description: ""
};

function App() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  // Lấy danh sách thiết bị
  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);
      setDevices(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Không thể tải danh sách thiết bị. Vui lòng kiểm tra Backend!"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // Tìm kiếm thiết bị
  const filteredDevices = devices.filter((device) => {
    const keyword = search.trim().toLowerCase();

    return (
      device.deviceId?.toLowerCase().includes(keyword) ||
      device.name?.toLowerCase().includes(keyword) ||
      device.deviceType?.toLowerCase().includes(keyword) ||
      device.room?.toLowerCase().includes(keyword) ||
      device.brand?.toLowerCase().includes(keyword) ||
      device.model?.toLowerCase().includes(keyword)
    );
  });

  // Phân loại trạng thái
  const getStatusClass = (status) => {
    if (["Đang sử dụng", "Dang su dung"].includes(status)) {
      return "status-active";
    }

    if (status === "Đang sửa chữa") {
      return "status-repair";
    }

    if (status === "Hư hỏng") {
      return "status-broken";
    }

    return "status-inactive";
  };

  // Mở form thêm mới
  const openAddForm = () => {
    setEditingId(null);
    setFormData({ ...INITIAL_FORM });
    setShowForm(true);
  };

  // Mở form chỉnh sửa
  const openEditForm = (device) => {
    setEditingId(device._id);

    setFormData({
      deviceId: device.deviceId || "",
      name: device.name || "",
      deviceType: device.deviceType || "",
      room: device.room || "",
      brand: device.brand || "",
      model: device.model || "",
      quantity: device.quantity ?? 1,
      status: device.status || "Đang sử dụng",
      purchaseDate: device.purchaseDate
        ? new Date(device.purchaseDate).toISOString().slice(0, 10)
        : "",
      description: device.description || ""
    });

    setShowForm(true);
  };

  // Đóng form
  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setFormData({ ...INITIAL_FORM });
  };

  // Thay đổi dữ liệu form
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? value : value
    }));
  };

  // Thêm hoặc cập nhật thiết bị
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.deviceId.trim() ||
      !formData.name.trim() ||
      !formData.deviceType.trim() ||
      !formData.room.trim()
    ) {
      alert("Vui lòng nhập đầy đủ các thông tin bắt buộc!");
      return;
    }

    if (
      formData.quantity === "" ||
      !Number.isFinite(Number(formData.quantity)) ||
      Number(formData.quantity) < 0
    ) {
      alert("Số lượng phải là một số không âm!");
      return;
    }

    const payload = {
      ...formData,
      deviceId: formData.deviceId.trim(),
      name: formData.name.trim(),
      deviceType: formData.deviceType.trim(),
      room: formData.room.trim(),
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      quantity: Number(formData.quantity),
      purchaseDate: formData.purchaseDate || null
    };

    try {
      setSaving(true);

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload);
        alert("Cập nhật thiết bị thành công!");
      } else {
        await axios.post(API_URL, payload);
        alert("Thêm thiết bị thành công!");
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ ...INITIAL_FORM });

      await fetchDevices();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Không thể lưu thiết bị. Vui lòng kiểm tra lại!"
      );
    } finally {
      setSaving(false);
    }
  };

  // Xóa thiết bị
  const handleDelete = async (id, deviceName) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa thiết bị "${deviceName}" không?`
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      alert("Xóa thiết bị thành công!");
      await fetchDevices();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Không thể xóa thiết bị!"
      );
    }
  };

  // Thống kê
  const stats = [
    {
      label: "Tổng thiết bị",
      value: devices.length,
      icon: Package,
      color: "blue"
    },
    {
      label: "Đang sử dụng",
      value: devices.filter((d) =>
        ["Đang sử dụng", "Dang su dung"].includes(d.status)
      ).length,
      icon: CheckCircle,
      color: "green"
    },
    {
      label: "Đang sửa chữa",
      value: devices.filter(
        (d) => d.status === "Đang sửa chữa"
      ).length,
      icon: Wrench,
      color: "orange"
    },
    {
      label: "Hư hỏng",
      value: devices.filter(
        (d) => d.status === "Hư hỏng"
      ).length,
      icon: AlertTriangle,
      color: "red"
    }
  ];

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Monitor size={25} />
          </div>

          <div>
            <h2>DeviceHub</h2>
            <span>Management System</span>
          </div>
        </div>

        <div className="menu-title">MENU</div>

        <div className="menu-item">
          <LayoutDashboard size={19} />
          <span>Tổng quan</span>
        </div>

        <div className="menu-item active">
          <Monitor size={19} />
          <span>Quản lý thiết bị</span>
        </div>

        <div className="sidebar-footer">
          <div className="avatar">TT</div>

          <div>
            <strong>Quản trị viên</strong>
            <span>Administrator</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Quản lý thiết bị</h1>
            <p>
              Quản lý và theo dõi toàn bộ thiết bị trong hệ thống
            </p>
          </div>

          <button
            className="refresh-btn"
            onClick={fetchDevices}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Làm mới
          </button>
        </header>

        {/* STATISTICS */}
        <section className="stats-grid">
          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <div className="stat-card" key={index}>
                <div className={`stat-icon ${item.color}`}>
                  <Icon size={23} />
                </div>

                <div>
                  <p>{item.label}</p>
                  <h2>{item.value}</h2>
                </div>
              </div>
            );
          })}
        </section>

        {/* DEVICE LIST */}
        <section className="device-section">
          <div className="section-header">
            <div>
              <h2>Danh sách thiết bị</h2>
              <p>Thông tin chi tiết các thiết bị hiện có</p>
            </div>

            <button className="add-btn" onClick={openAddForm}>
              <Plus size={19} />
              Thêm thiết bị
            </button>
          </div>

          <div className="toolbar">
            <div className="search-box">
              <Search size={19} />

              <input
                type="text"
                placeholder="Tìm theo mã, tên, loại hoặc phòng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <span className="result-count">
              {filteredDevices.length} thiết bị
            </span>
          </div>

          {loading ? (
            <div className="message">
              <RefreshCw className="spin" size={25} />
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="message error-message">
              {error}
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>MÃ THIẾT BỊ</th>
                    <th>TÊN THIẾT BỊ</th>
                    <th>LOẠI</th>
                    <th>PHÒNG</th>
                    <th>THƯƠNG HIỆU</th>
                    <th>SỐ LƯỢNG</th>
                    <th>TRẠNG THÁI</th>
                    <th>THAO TÁC</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDevices.map((device) => (
                    <tr key={device._id}>
                      <td className="device-code">
                        {device.deviceId}
                      </td>

                      <td className="device-name">
                        {device.name}
                      </td>

                      <td>{device.deviceType}</td>
                      <td>{device.room}</td>
                      <td>{device.brand || "-"}</td>
                      <td>{device.quantity}</td>

                      <td>
                        <span
                          className={`status ${getStatusClass(
                            device.status
                          )}`}
                        >
                          {device.status}
                        </span>
                      </td>

                      <td>
                        <div className="actions">
                          <button
                            className="action-btn edit"
                            title="Sửa thiết bị"
                            onClick={() => openEditForm(device)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="action-btn delete"
                            title="Xóa thiết bị"
                            onClick={() =>
                              handleDelete(device._id, device.name)
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredDevices.length === 0 && (
                    <tr>
                      <td colSpan="8" className="empty">
                        Không tìm thấy thiết bị nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="footer">
          DeviceHub © 2026 - Hệ thống quản lý thiết bị
        </footer>
      </main>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="modal-overlay">
          <div className="device-modal">
            <div className="modal-header">
              <div>
                <h2>
                  {editingId ? "Cập nhật thiết bị" : "Thêm thiết bị mới"}
                </h2>
                <p>Nhập thông tin chi tiết thiết bị</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeForm}
                disabled={saving}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Mã thiết bị *</label>
                  <input
                    name="deviceId"
                    value={formData.deviceId}
                    onChange={handleChange}
                    placeholder="Ví dụ: TB004"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tên thiết bị *</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nhập tên thiết bị"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Loại thiết bị *</label>
                  <input
                    name="deviceType"
                    value={formData.deviceType}
                    onChange={handleChange}
                    placeholder="Ví dụ: Máy tính"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phòng sử dụng *</label>
                  <input
                    name="room"
                    value={formData.room}
                    onChange={handleChange}
                    placeholder="Ví dụ: A101"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Thương hiệu</label>
                  <input
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Ví dụ: Dell"
                  />
                </div>

                <div className="form-group">
                  <label>Model</label>
                  <input
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="Nhập model"
                  />
                </div>

                <div className="form-group">
                  <label>Số lượng *</label>
                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Trạng thái *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="Đang sử dụng">Đang sử dụng</option>
                    <option value="Hư hỏng">Hư hỏng</option>
                    <option value="Đang sửa chữa">Đang sửa chữa</option>
                    <option value="Ngừng sử dụng">Ngừng sử dụng</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Ngày mua</label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Mô tả</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Nhập mô tả thiết bị..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={saving}
                >
                  <Save size={17} />
                  {saving
                    ? "Đang lưu..."
                    : editingId
                      ? "Cập nhật"
                      : "Lưu thiết bị"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
