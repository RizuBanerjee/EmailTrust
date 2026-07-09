import { useEffect, useState } from "react";
import api from "../api/api";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import Badge from "../components/ui/Badge.jsx";
import Modal from "../components/ui/Modal.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import {
  Package,
  Check,
  RefreshCw,
  ChevronUp,
  Star,
  History,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

const planOrder = { FREE: 0, STARTER: 1, PRO: 2, ENTERPRISE: 3 };

const planDetails = {
  FREE:       { icon: "🌱", highlight: false, desc: "Get started for free" },
  STARTER:    { icon: "⚡", highlight: false, desc: "For growing projects" },
  PRO:        { icon: "🚀", highlight: true,  desc: "For serious users" },
  ENTERPRISE: { icon: "🏢", highlight: false, desc: "Scale without limits" },
};

const planColors = {
  FREE:       "default",
  STARTER:    "info",
  PRO:        "brand",
  ENTERPRISE: "success",
};

function getErrorMessage(err, fallback) {
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) =>
        typeof item === "string"
          ? item
          : item.msg || item.message || JSON.stringify(item)
      )
      .join("; ");
  }
  return fallback;
}

export default function Subscription() {
  const email = localStorage.getItem("user_email");

  const [subscription, setSubscription]               = useState(null);
  const [plans, setPlans]                             = useState({});
  const [history, setHistory]                         = useState([]);
  const [loading, setLoading]                           = useState(true);
  const [message, setMessage]                         = useState("");
  const [cancelModal, setCancelModal]                 = useState(false);
  const [actionLoading, setActionLoading]             = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const [current, availablePlans, subscriptionHistory] = await Promise.all([
        api.get(`/subscription/${email}`),
        api.get("/subscription/plans"),
        api.get(`/subscription/history/${email}`),
      ]);
      setSubscription(current.data);
      setPlans(availablePlans.data);
      setHistory(subscriptionHistory.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  // Open Razorpay checkout for a paid plan and verify the payment on success.
  async function initiatePayment(plan) {
    if (!window.Razorpay) {
      setMessage("Razorpay checkout is not loaded. Please refresh the page.");
      return;
    }

    try {
      setActionLoading(true);
      setMessage("");
      const order = await api.post("/payment/create-order", { email, plan });

      const { key_id, order_id, amount, currency } = order.data || {};
      if (!key_id || !order_id || !amount || !currency) {
        setMessage("Invalid order response from server.");
        setActionLoading(false);
        return;
      }

      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: "EmailTrust",
        description: `${plan} Plan Subscription`,
        order_id: order_id,
        handler: async (response) => {
          try {
            const verify = await api.post("/payment/verify", {
              email,
              plan,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setMessage(verify.data.message);
            await loadData();
          } catch (err) {
            setMessage(getErrorMessage(err, "Payment verification failed."));
          } finally {
            setActionLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setMessage("Payment window closed.");
            setActionLoading(false);
          },
          confirm_close: true,
        },
        prefill: {
          email: email,
        },
        theme: {
          color: "#6366f1",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        setMessage(response.error?.description || "Payment failed.");
        setActionLoading(false);
      });

      rzp.open();
    } catch (err) {
      setMessage(getErrorMessage(err, "Failed to start payment."));
      setActionLoading(false);
    }
  }

  // Renew the current plan through Razorpay (free plans use the manual renew path).
  async function initiateRenew() {
    const plan = subscription?.plan;
    if (!plan) return;

    if (plans[plan]?.price === 0) {
      await manualRenew();
      return;
    }

    await initiatePayment(plan);
  }

  // Fallback manual renewal used for free plans.
  async function manualRenew() {
    try {
      setActionLoading(true);
      setMessage("");
      const res = await api.post(`/subscription/renew?email=${email}`);
      setMessage(res.data.message);
      await loadData();
    } catch (err) {
      setMessage(getErrorMessage(err, "Renewal failed."));
    } finally {
      setActionLoading(false);
    }
  }

  async function cancelSubscription() {
    try {
      setActionLoading(true);
      setMessage("");
      const res = await api.post(`/subscription/cancel?email=${email}`);
      setMessage(res.data.message);
      setCancelModal(false);
      await loadData();
    } catch (err) {
      setMessage(getErrorMessage(err, "Cancellation failed."));
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const currentLevel = planOrder[subscription?.plan] ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="page-title">Subscription</h2>
            <p className="muted mt-0.5">Manage your plan and billing</p>
          </div>
          <button onClick={loadData} className="btn-secondary">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Message banner */}
        {message && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
            <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
            <p className="text-sm text-brand-700 dark:text-brand-300">{message}</p>
            <button onClick={() => setMessage("")} className="ml-auto text-brand-400 hover:text-brand-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Current subscription summary */}
        {subscription && (
          <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20">
                <Package className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Current Plan</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {subscription.plan}
                  </span>
                  <Badge variant={planColors[subscription.plan] || "default"}>Active</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {subscription.credits_remaining?.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Credits left</p>
              </div>
              <div className="flex gap-2">
                <button onClick={initiateRenew} disabled={actionLoading} className="btn-primary">
                  <RefreshCw className="w-4 h-4" />
                  Renew
                </button>
                <button onClick={() => setCancelModal(true)} disabled={actionLoading} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Plan cards */}
        <div>
          <h3 className="section-title mb-4">Available Plans</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Object.entries(plans).map(([name, data]) => {
              const targetLevel  = planOrder[name] ?? 0;
              const isCurrent    = name === subscription?.plan;
              const isDowngrade  = targetLevel < currentLevel;
              const details      = planDetails[name] || {};

              return (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`card p-5 flex flex-col relative ${
                    details.highlight
                      ? "ring-2 ring-brand-500 dark:ring-brand-400"
                      : ""
                  }`}
                >
                  {details.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-600 text-white text-xs font-semibold">
                        <Star className="w-3 h-3" /> Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-2xl mb-2">{details.icon}</div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{name}</h4>
                    {isCurrent && <Badge variant="brand">Current</Badge>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{details.desc}</p>

                  <div className="mb-4">
                    <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      ₹{data.price}
                    </span>
                    {data.price > 0 && (
                      <span className="text-xs text-slate-400 ml-1">/mo</span>
                    )}
                  </div>

                  <div className="space-y-2 mb-6 flex-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {data.credits?.toLocaleString()} credits
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Email verification API
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Batch verification
                    </div>
                  </div>

                  {isCurrent ? (
                    <button disabled className="btn-secondary justify-center opacity-60 cursor-default">
                      Current Plan
                    </button>
                  ) : isDowngrade ? (
                    <button disabled className="btn-secondary justify-center opacity-40 cursor-not-allowed">
                      Not Available
                    </button>
                  ) : (
                    <button
                      onClick={() => initiatePayment(name)}
                      disabled={actionLoading}
                      className="btn-primary justify-center"
                    >
                      <ChevronUp className="w-4 h-4" />
                      Upgrade
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* History table */}
        {history.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              <h3 className="section-title text-sm">Subscription History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">Plan</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Credits</th>
                    <th className="table-header">Amount</th>
                    <th className="table-header">Payment ID</th>
                    <th className="table-header">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="table-cell">
                        <Badge variant={planColors[item.plan_name] || "default"}>{item.plan_name}</Badge>
                      </td>
                      <td className="table-cell">
                        <Badge variant={item.status === "active" ? "success" : "default"}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="table-cell tabular-nums">{item.credits_granted?.toLocaleString()}</td>
                      <td className="table-cell tabular-nums">₹{item.amount_paid}</td>
                      <td className="table-cell font-mono text-xs text-slate-500">{item.payment_id || "—"}</td>
                      <td className="table-cell text-slate-500">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Cancel modal */}
      <Modal
        open={cancelModal}
        onClose={() => setCancelModal(false)}
        title="Cancel Subscription"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setCancelModal(false)}>
              Keep Plan
            </button>
            <button className="btn-danger" onClick={cancelSubscription} disabled={actionLoading}>
              {actionLoading ? "Cancelling…" : "Cancel Subscription"}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Are you sure you want to cancel your subscription? Your credits will remain available until the end of the billing period.
        </p>
      </Modal>
    </DashboardLayout>
  );
}