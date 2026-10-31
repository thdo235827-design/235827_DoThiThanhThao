
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const Device = require("./models/Device");

dotenv.config();

const app = express();

// ===============================
// 1. MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// 2. API TRANG CHỦ
// ===============================
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Device Management API!",
        status: "Running",
        database: mongoose.connection.readyState === 1
            ? "Connected"
            : "Disconnected"
    });
});

// ===============================
// 3. API KIỂM TRA BACKEND
// ===============================
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is running!",
        database: mongoose.connection.readyState === 1
            ? "Connected"
            : "Disconnected"
    });
});

// ===============================
// 4. API LẤY DANH SÁCH THIẾT BỊ
// GET /api/devices
// GET /api/devices?search=projector
// ===============================
app.get("/api/devices", async (req, res) => {
    try {
        const { search } = req.query;

        let filter = {};

        if (search) {
            filter = {
                $or: [
                    { deviceId: { $regex: search, $options: "i" } },
                    { name: { $regex: search, $options: "i" } },
                    { deviceType: { $regex: search, $options: "i" } },
                    { room: { $regex: search, $options: "i" } },
                    { brand: { $regex: search, $options: "i" } },
                    { model: { $regex: search, $options: "i" } }
                ]
            };
        }

        const devices = await Device.find(filter);

        res.status(200).json({
            success: true,
            total: devices.length,
            data: devices
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===============================
// 5. API LẤY CHI TIẾT THIẾT BỊ
// GET /api/devices/:id
// ===============================
app.get("/api/devices/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID thiết bị không hợp lệ!"
            });
        }

        const device = await Device.findById(req.params.id);

        if (!device) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thiết bị!"
            });
        }

        res.status(200).json({
            success: true,
            data: device
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===============================
// 6. API THÊM THIẾT BỊ
// POST /api/devices
// ===============================
app.post("/api/devices", async (req, res) => {
    try {
        const newDevice = new Device(req.body);

        const savedDevice = await newDevice.save();

        res.status(201).json({
            success: true,
            message: "Thêm thiết bị thành công!",
            data: savedDevice
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Mã thiết bị đã tồn tại!"
            });
        }

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// ===============================
// 7. API CẬP NHẬT THIẾT BỊ
// PUT /api/devices/:id
// ===============================
app.put("/api/devices/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID thiết bị không hợp lệ!"
            });
        }

        const updatedDevice = await Device.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedDevice) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thiết bị!"
            });
        }

        res.status(200).json({
            success: true,
            message: "Cập nhật thiết bị thành công!",
            data: updatedDevice
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Mã thiết bị đã tồn tại!"
            });
        }

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// ===============================
// 8. API XÓA THIẾT BỊ
// DELETE /api/devices/:id
// ===============================
app.delete("/api/devices/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID thiết bị không hợp lệ!"
            });
        }

        const deletedDevice = await Device.findByIdAndDelete(
            req.params.id
        );

        if (!deletedDevice) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thiết bị!"
            });
        }

        res.status(200).json({
            success: true,
            message: "Xóa thiết bị thành công!",
            data: deletedDevice
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===============================
// 9. KẾT NỐI MONGODB ATLAS
// ===============================
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Atlas connected successfully!");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error.message);
    });

// ===============================
// 10. KHỞI ĐỘNG SERVER
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});
