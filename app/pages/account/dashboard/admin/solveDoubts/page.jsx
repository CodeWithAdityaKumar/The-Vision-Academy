"use client"
import SolveDoubt from '@/components/dashboard/teacher/SolveDoubt';

const page = () => {

  return (
    <div>
      <SolveDoubt 
        teacherSubject="All Subjects"
        userRole="admin"
      />
    </div>
  );
};

export default page;
