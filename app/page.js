import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import CoursesSection from '../components/CoursesSection';
import TeachersSection from '../components/TeachersSection';
import ContactSection from '../components/ContactSection';
import FeaturesSection from '@/components/FeaturesSection';
import AddUsers from '@/components/dashboard/admin/AddUsers';
import ManageUsers from '@/components/dashboard/admin/ManageUsers';
export default function Home() {
  return (
    <div>
      <HeroSection />
      <AddUsers/>
      <ManageUsers/>
      <AboutSection />
      <FeaturesSection />
      <CoursesSection />
      <TeachersSection />
      <ContactSection />
    </div>
  );
}
