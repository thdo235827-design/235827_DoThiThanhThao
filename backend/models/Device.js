
const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: [true, "Mã thiết bị không được để trống!"],
        unique: true,
        trim: true
    },

    name: {
        type: String,
        required: [true, "Tên thiết bị không được để trống!"],
        trim: true
    },

    deviceType: {
        type: String,
        required: [true, "Loại thiết bị không được để trống!"],
        trim: true
    },

    room: {
        type: String,
        required: [true, "Phòng sử dụng không được để trống!"],
        trim: true
    },

    brand: {
        type: String,
        trim: true
    },

    model: {
        type: String,
        trim: true
    },

    quantity: {
        type: Number,
        required: [true, "Số lượng không được để trống!"],
        min: [0, "Số lượng không được nhỏ hơn 0!"],
        default: 0
    },

    status: {
        type: String,
        required: [true, "Trạng thái không được để trống!"],
        enum: [
            "Đang sử dụng",
            "Hư hỏng",
            "Đang sửa chữa",
            "Ngừng sử dụng",
            "Dang su dung"
        ]
    },

    purchaseDate: {
        type: Date,
        default: null
    },

    description: {
        type: String,
        trim: true,
        default: ""
    }

}, {
    timestamps: true
});

// Tạo Model Device, sử dụng collection devices
module.exports = mongoose.model(
    "Device",
    deviceSchema,
    "devices"
);
