import React, { useEffect, useState } from "react";
import { Settings, ShieldCheck } from "lucide-react";
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
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchSettings()
      .then((data) => {
        if (cancelled) return;
        
        if (data && data.credit_hour_price !== null && data.credit_hour_price !== undefined) {
          setExists(true);
          setPrice(String(data.credit_hour_price));
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
    try {
      if (exists) {
        await updateSettings({ credit_hour_price: Number(price) });
      } else {
        await createSettings({ credit_hour_price: Number(price) });
        setExists(true);
      }
      toast.success("تم حفظ إعدادات النظام");
    } catch (err) {
      toast.error(err.message || "تعذّر حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="overview-header">
        <span className="dashboard-badge">
          <ShieldCheck size={14} /> إعدادات النظام
        </span>
        <h1>الإعدادات العامة</h1>
        <p>إعداد موحّد لسعر الساعة المعتمدة يُستخدم عند احتساب الرسوم الدراسية.</p>
      </div>

      <div className="dashboard-table-card" style={{ marginTop: 20, maxWidth: 460 }}>
        {loading ? (
          <div className="overview-loading">
            <span className="spinner dark" /> جارِ التحميل...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>سعر الساعة المعتمدة</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="50000"
              />
              {error && <span className="error">{error}</span>}
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving} style={{ marginTop: 6 }}>
              {saving ? <span className="spinner" /> : <Settings size={16} />}
              {exists ? "حفظ التعديلات" : "إنشاء الإعداد"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
