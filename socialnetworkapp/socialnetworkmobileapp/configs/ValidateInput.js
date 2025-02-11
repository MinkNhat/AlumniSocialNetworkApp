export const validateField = (field, value, user, isLogin=false) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    const errors = {
        avatar: "Vui lòng chọn ảnh đại diện!",
        last_name: "Vui lòng nhập họ và tên!",
        student_id: "Vui lòng nhập mã số sinh viên!",
        email: "Vui lòng nhập địa chỉ email!",
        username: "Vui lòng nhập tên tài khoản!",
        password: "Vui lòng nhập mật khẩu!",
        comfirm: "Vui lòng nhập lại mật khẩu!"
    };

    if (!value && Object.keys(errors).includes(field)) {
        return { msg: errors[field] || "Trường này không được để trống!", field }
    }

    if(!isLogin) {
        if (field === "password" && !passwordRegex.test(value)) {
            return { msg: "Mật khẩu phải có ít nhất 6 ký tự (bao gồm chữ cái và chữ số)", field }
        }
    }

    if (field === "email" && !emailRegex.test(value)) {
        return { msg: "Email không đúng định dạng", field }
    }

    if (field === "comfirm" && value !== user.password) {
        return { msg: "Mật khẩu xác nhận không khớp!", field }
    }

    return null
};
