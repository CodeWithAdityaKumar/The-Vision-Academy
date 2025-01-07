import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import CoursesSection from '../components/CoursesSection';
import TeachersSection from '../components/TeachersSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <AboutSection />
      <CoursesSection />
      <TeachersSection />
      <ContactSection />
    </div>
  );
}
