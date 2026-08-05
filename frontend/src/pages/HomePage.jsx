import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>
        <Hero />
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;
