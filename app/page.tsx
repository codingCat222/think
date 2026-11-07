import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Challenge from "@/components/Challenge";
import Categories from "@/components/Categories";
import HowItWorks from "@/components/HowItWorks";
import EventDetails from "@/components/EventDetails";
import RegistrationForm from "@/components/RegistrationForm";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <NavBar />
      <Hero />
      <About />
      <Challenge />
      <Categories />
      <HowItWorks />
      <EventDetails />
      <RegistrationForm />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}
