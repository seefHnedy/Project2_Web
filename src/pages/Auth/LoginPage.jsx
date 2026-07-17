import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  UserRound,
  BookOpenCheck,
  Wifi,
} from "lucide-react";
import "./LoginPage.css";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!username.trim()) nextErrors.username = "اسم المستخدم مطلوب";
    if (!password) nextErrors.password = "كلمة المرور مطلوبة";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");
    if (!validate()) return;

    try {
      setLoading(true);
      await login(username.trim(), password);
      toast.success("تم تسجيل الدخول بنجاح، أهلاً بك");
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(error.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-header">
            <span className="header-badge">
              <GraduationCap size={15} /> Unify Student Portal
            </span>
            <h2>تسجيل الدخول</h2>
            <p>أدخل بيانات حسابك للوصول إلى لوحة التحكم الأكاديمية</p>
          </div>

          {serverError && <div className="alert-error">{serverError}</div>}

          <label className="field">
            <span>اسم المستخدم</span>
            <div className={`input-box ${errors.username ? "has-error" : ""}`}>
              <UserRound size={20} />
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="أدخل اسم المستخدم"
                autoComplete="username"
              />
            </div>
            {errors.username && <small className="field-error">{errors.username}</small>}
          </label>

          <label className="field">
            <span>كلمة المرور</span>
            <div className={`input-box ${errors.password ? "has-error" : ""}`}>
              <Lock size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            {errors.password && <small className="field-error">{errors.password}</small>}
          </label>

          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : "تسجيل الدخول"}
          </button>
        </form>
      </section>

      <section className="login-visual" aria-label="Smart portal overview">
        <div className="brand-card">
          <div className="brand-logo">
            <GraduationCap size={34} />
          </div>
          <div>
            <p className="brand-kicker">Smart University</p>
            <h1>بوابة الطالب الذكية</h1>
            <p>
              منصة موحدة لإدارة الحياة الأكاديمية: بيانات الطلاب، الأقسام، الحضور
              الذكي بتقنية NFC، والحسابات الجامعية.
            </p>
          </div>
        </div>

        <div className="floating-card top-card">
          <BookOpenCheck size={22} />
          <div>
            <strong>Academic Records</strong>
            <span>الطلاب · الأقسام · الحسابات</span>
          </div>
        </div>

        <div className="floating-card bottom-card">
          <Wifi size={22} />
          <div>
            <strong>NFC Attendance</strong>
            <span>حضور ذكي وآمن</span>
          </div>
        </div>
      </section>
    </main>
  );
}
