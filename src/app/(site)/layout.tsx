import { AuthProvider } from "@/components/AuthProvider";
import ProfileGate from "@/components/family/ProfileGate";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SkyScenery from "@/components/SkyScenery";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SkyScenery />
      <div className="site-shell relative z-[1] flex min-h-0 flex-1 flex-col">
        <AuthProvider>
          <SiteHeader />
          <div className="site-shell__content flex min-h-0 flex-1 flex-col">
            <ProfileGate>{children}</ProfileGate>
          </div>
          <SiteFooter />
        </AuthProvider>
      </div>
    </>
  );
}
