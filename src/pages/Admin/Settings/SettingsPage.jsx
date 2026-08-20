import React, { useEffect, useState } from "react";
import { Settings, ShieldCheck, CheckCircle2 } from "lucide-react";
import "../Dashboard/OverviewPage.css";
import "../../../components/common/styles/controls.css";
import { useToast } from "../../../context/ToastContext";
import { createSettings, fetchSettings, updateSettings } from "../../../services/admin/systemSettingService";

export default function SettingsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exists, setExists] = useState(false);
  const [price, setPrice] = useState("");
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchSettings()
      .then((data) => {
        if (cancelled) return;
        
        if (data && data.credit_hour_price !== null && data.credit_hour_price !== undefined) {
          setExists(true);
          setPrice(String(data.credit_hour_price));
          setIsRegistrationOpen(Boolean(data.is_registration_open));
        } else {
          setExists(false);
        }
      })
      .catch(() => setExists(false))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!price || Number(price) <= 0) {
      setError("الرجاء إدخال سعر صحيح للساعة المعتمدة");
      return;
    }

    setSaving(true);
    const payload = {
      credit_hour_price: Number(price),
      is_registration_open: isRegistrationOpen,
    };

    try {
      if (exists) {
        await updateSettings(payload);
      } else {
        await createSettings(payload);
        setExists(true);
      }
      toast.success("تم حفظ إعدادات النظام بنجاح");
    } catch (err) {
      toast.error(err.message || "تعذّر حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div className="overview-header">
        <span className="dashboard-badge">
          <ShieldCheck size={14} /> إعدادات النظام
        </span>
        <h1>الإعدادات العامة</h1>
      </div>

      {/* Main Card */}
      <div 
        className="dashboard-table-card" 
        style={{ 
          background: "#ffffff", 
          borderRadius: 16, 
          padding: 24, 
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
          border: "1px solid #e5e7eb"
        }}
      >
        {loading ? (
          <div className="overview-loading" style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 0", gap: 10, color: "#6b7280" }}>
            <span className="spinner dark" /> جارِ تحميل البيانات...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            
            {/* Field 1: Credit Hour Price */}
            <div className="form-field" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#374151" }}>
                سعر الساعة المعتمدة
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="50000"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: error ? "1px solid #ef4444" : "1px solid #d1d5db",
                    outline: "none",
                    fontSize: "0.95rem",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    boxSizing: "border-box"
                  }}
                />
              </div>
              {error && (
                <span className="error" style={{ color: "#ef4444", fontSize: "0.825rem", marginTop: 2 }}>
                  {error}
                </span>
              )}
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #f3f4f6", margin: "4px 0" }} />

            {/* Field 2: Custom Styled Switch for Registration */}
            <div 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between", 
                background: "#f9fafb", 
                padding: "12px 16px", 
                borderRadius: 12,
                border: "1px solid #f3f4f6"
              }}
            >
              <div>
                <span style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, color: "#111827" }}>
                  حالة التسجيل
                </span>
                <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  {isRegistrationOpen ? "التسجيل مفتوح للطلاب حالياً" : "التسجيل مغلق حالياً"}
                </span>
              </div>

              <label style={{ position: "relative", display: "inline-block", width: 46, height: 24, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={isRegistrationOpen}
                  onChange={(e) => setIsRegistrationOpen(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span 
                  style={{
                    position: "absolute",
                    cursor: "pointer",
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: isRegistrationOpen ? "#10b981" : "#d1d5db",
                    transition: "0.3s",
                    borderRadius: 24,
                  }}
                >
                  <span 
                    style={{
                      position: "absolute",
                      content: '""',
                      height: 18,
                      width: 18,
                      left: isRegistrationOpen ? 24 : 3,
                      bottom: 3,
                      backgroundColor: "white",
                      transition: "0.3s",
                      borderRadius: "50%",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                    }}
                  />
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button 
              className="btn btn-primary" 
              type="submit" 
              disabled={saving} 
              style={{ 
                marginTop: 8,
                padding: "12px 20px",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {saving ? <span className="spinner" /> : exists ? <CheckCircle2 size={18} /> : <Settings size={18} />}
              {exists ? "حفظ التعديلات" : "إنشاء الإعداد"}
            </button>

          </form>
        )}
      </div>
    </div>
  );
}