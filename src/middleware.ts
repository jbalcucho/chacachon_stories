import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/familia/:path*", "/admin/:path*", "/mis-cuentos/:path*"],
};
