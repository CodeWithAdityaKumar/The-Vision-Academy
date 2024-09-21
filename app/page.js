import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import CoursesSection from '../components/CoursesSection';
import TeachersSection from '../components/TeachersSection';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <AboutSection />
      <CoursesSection />
      <TeachersSection />
      {/* Add other sections here */}
    </div>
  );
}
