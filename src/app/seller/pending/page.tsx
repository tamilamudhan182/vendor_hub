import Link from "next/link";
import { Clock, Mail, ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SellerPendingPage() {
  const session = await auth();

  if (!session) redirect("/auth/signin");
  if (session.user.role !== "SELLER") redirect("/");
  if (session.user.sellerStatus === "APPROVED") redirect("/seller/dashboard");

  const status = session.user.sellerStatus;

  const statusConfig = {
    PENDING: {
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      title: "Application Under Review",
      desc: "Your seller application has been submitted and is being reviewed by our team. This usually takes up to 24 hours.",
      badge: "bg-amber-100 text-amber-700 border-amber-200",
      badgeText: "Pending Review",
    },
    REJECTED: {
      icon: XCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      title: "Application Not Approved",
      desc: "Unfortunately, your seller application was not approved at this time. You can update your details and reapply.",
      badge: "bg-red-100 text-red-700 border-red-200",
      badgeText: "Not Approved",
    },
    SUSPENDED: {
      icon: AlertCircle,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      title: "Account Suspended",
      desc: "Your seller account has been suspended. Please contact support for assistance.",
      badge: "bg-orange-100 text-orange-700 border-orange-200",
      badgeText: "Suspended",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-warm-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-card rounded-2xl border border-border shadow-warm-lg p-10 text-center">
          <div className={`w-20 h-20 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <Icon className={`w-10 h-10 ${config.iconColor}`} />
          </div>

          <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold mb-4 ${config.badge}`}>
            {config.badgeText}
          </div>

          <h1 className="font-display text-2xl font-bold text-primary mb-3">{config.title}</h1>
          <p className="text-muted-foreground leading-relaxed mb-8">{config.desc}</p>

          {status === "PENDING" && (
            <div className="space-y-3 text-left p-4 rounded-xl bg-warm-50 border border-warm-200 mb-8">
              <p className="text-sm font-semibold text-foreground">What happens next?</p>
              {[
                { icon: CheckCircle, text: "Our team reviews your shop details and location", done: true },
                { icon: CheckCircle, text: "We verify your contact information", done: false },
                { icon: CheckCircle, text: "Account activated and you can start selling!", done: false },
              ].map(({ icon: StepIcon, text, done }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <StepIcon className={`w-4 h-4 flex-shrink-0 ${done ? "text-green-500" : "text-muted-foreground"}`} />
                  <span className={`text-sm ${done ? "text-foreground" : "text-muted-foreground"}`}>{text}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <a href="mailto:support@vendorhub.in"
              className="flex items-center justify-center gap-2 border-2 border-primary text-primary rounded-lg py-2.5 text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-all">
              <Mail className="w-4 h-4" /> Contact Support
            </a>
            <Link href="/"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Go back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
