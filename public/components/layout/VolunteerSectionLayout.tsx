import React from 'react';
import { Outlet } from 'react-router-dom';
import VolunteerSidebar from './VolunteerSidebar';

const VolunteerSectionLayout: React.FC = () => {
  return (
    <div className="volunteer-page py-5">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-3">
            <VolunteerSidebar />
          </div>
          <div className="col-lg-9">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerSectionLayout;
