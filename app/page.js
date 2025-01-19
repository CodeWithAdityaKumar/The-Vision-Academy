import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import CoursesSection from '../components/CoursesSection';
import TeachersSection from '../components/TeachersSection';
import ContactSection from '../components/ContactSection';
import FeaturesSection from '@/components/FeaturesSection';
import PopUpNotice from '@/components/PopUpNotice';

export default function Home() {
  return (
    <div>
      <PopUpNotice />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <CoursesSection />
      <TeachersSection />
      <ContactSection />
    </div>
  );
}
