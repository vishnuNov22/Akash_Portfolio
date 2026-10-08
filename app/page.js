import Preloader from "@/components/Preloader";
import Cursor from "@/components/Cursor";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Statement from "@/components/Statement";
import Expertise from "@/components/Expertise";
import Reel from "@/components/Reel";
import Profile from "@/components/Profile";
import Archive from "@/components/Archive";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import LightboxProvider from "@/components/Lightbox";

export default function Home() {
  return (
    <LightboxProvider>
      <Preloader />
      <Cursor />
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Statement />
        <Expertise />
        <Reel />
        <Profile />
        <Archive />
        <Contact />
      </main>
      <Footer />
      <div className="grain" aria-hidden="true" />
    </LightboxProvider>
  );
}
