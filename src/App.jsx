import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import { SeasonProvider } from "./context/SeasonContext";
import Nav from "./components/nav/Nav";
import Hero from "./components/page/hero/Hero";
import About from "./components/page/about/About";
import Coins from "./components/page/coinspremium/Coins";
import Premium from "./components/page/coinspremium/Premium";
import Features from "./components/page/features/Features";
import Collections from "./components/page/collections/Collections";
import Banner from "./components/page/banner/Banner";
import Testimonial from "./components/page/testimonial/Testimonial";
import Footer from "./components/footer/Footer";
import CYF from "./components/cyf/CYF";
import Terms from "./components/footer/explore/Terms";
import Privacy from "./components/footer/explore/Privacy";
import CookieConsent from "./context/CookieConsent";
import NotificationsPanel from "./components/notifications/NotificationsPanel";
import AdminPanel from "./components/notifications/AdminPanel";
import ProtectedAdminRoute from "./components/auth/ProtectedAdminRoute";
import { NotificationsProvider } from "./context/NotificationsContext";
import { CartProvider } from "./context/CartContext";
import Checkout from "./components/cart/Checkout";
import PaymentFlow from "./components/payment/PaymentFlow";

import "./App.scss";


const App = () => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <AuthProvider>
      <SeasonProvider>
         <NotificationsProvider>
          <CartProvider>
        <Router>
          <CookieConsent />
          {showNotifications && (
            <NotificationsPanel onClose={() => setShowNotifications(false)} />
          )}
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <div className="wrapper">
                    <Nav onToggleNotifications={() => setShowNotifications(true)} />
                    <Hero />
                  </div>
                  <Features />
                  <About />
                  <Coins />
                  <Premium />
                  <Collections />
                  <Banner />
                  <Testimonial />
                  <Footer />
                </>
              }
            />
            <Route path="/cyf" element={<CYF onToggleNotifications={() => setShowNotifications(true)} />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/notification-panel" element={ <ProtectedAdminRoute><AdminPanel /></ProtectedAdminRoute> } />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<PaymentFlow />} />
            
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={1500}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            pauseOnHover
            draggable
            theme="colored"
          />
        </Router>
        </CartProvider>
        </NotificationsProvider>
      </SeasonProvider>
    </AuthProvider>
  );
};

export default App;