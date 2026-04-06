import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RequireAuth from './components/auth/RequireAuth';
import { ADMIN_ROLES, ORGANIZER_ROLES, VOLUNTEER_ROLES } from './constants/roles';
import MainLayout from './components/layout/MainLayout';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/variables.css';

// Lazy load actual pages
const Home = lazy(() => import('./pages/public/Home'));
const EventList = lazy(() => import('./pages/events/EventList'));
const EventDetails = lazy(() => import('./pages/events/EventDetails'));
const VolunteerDashboard = lazy(() => import('./pages/volunteer/VolunteerDashboard'));
const FavoriteEvents = lazy(() => import('./pages/volunteer/FavoriteEvents'));
const MyRegistrations = lazy(() => import('./pages/volunteer/MyRegistrations'));
const VolunteerProfile = lazy(() => import('./pages/volunteer/VolunteerProfile'));
const OrganizationList = lazy(() => import('./pages/organizations/OrganizationList'));
const OrganizationDetails = lazy(() => import('./pages/organizations/OrganizationDetails'));
const OrganizationRegister = lazy(() => import('./pages/organizations/OrganizationRegister'));
const About = lazy(() => import('./pages/public/About'));
const Contact = lazy(() => import('./pages/public/Contact'));
const SearchPage = lazy(() => import('./pages/public/Search'));
const DonatePage = lazy(() => import('./pages/public/Donate'));
const PaymentResultPage = lazy(() => import('./pages/public/PaymentResult'));
const PrivacyPage = lazy(() => import('./pages/public/Privacy'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const EventRegisterPage = lazy(() => import('./pages/events/EventRegister'));
const AccountSettings = lazy(() => import('./pages/volunteer/AccountSettings'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminEventApprovalsPage = lazy(() => import('./pages/admin/AdminEventApprovalsPage'));
const AdminModerationPage = lazy(() => import('./pages/admin/AdminModerationPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const OrganizerOverview = lazy(() => import('./pages/organizer/OrganizerOverview'));
const OrganizerEventManagementPage = lazy(() => import('./pages/organizer/OrganizerEventManagementPage'));
const OrganizerOrganizationManagementPage = lazy(() => import('./pages/organizer/OrganizerOrganizationManagementPage'));
const OrganizerVolunteersPage = lazy(() => import('./pages/organizer/OrganizerVolunteersPage'));
const OrganizerVolunteerDetails = lazy(() => import('./pages/organizer/OrganizerVolunteerDetails'));
const OrganizerVolunteerHistory = lazy(() => import('./pages/organizer/OrganizerVolunteerHistory'));
const OrganizationSuccess = lazy(() => import('./pages/organizations/OrganizationSuccess'));

// Minimal loading spinner
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center vh-100">
    <div className="spinner-border text-success" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <MainLayout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<EventList />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route
              path="/volunteer/dashboard"
              element={
                <RequireAuth>
                  <VolunteerDashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/volunteer/favorites"
              element={
                <RequireAuth>
                  <FavoriteEvents />
                </RequireAuth>
              }
            />
            <Route
              path="/volunteer/registrations"
              element={
                <RequireAuth>
                  <MyRegistrations />
                </RequireAuth>
              }
            />
            <Route
              path="/volunteer/profile"
              element={
                <RequireAuth>
                  <VolunteerProfile />
                </RequireAuth>
              }
            />
            <Route
              path="/account/settings"
              element={
                <RequireAuth roles={VOLUNTEER_ROLES}>
                  <AccountSettings />
                </RequireAuth>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAuth roles={ADMIN_ROLES}>
                  <AdminOverview />
                </RequireAuth>
              }
            />
            <Route
              path="/organizer"
              element={
                <RequireAuth roles={ORGANIZER_ROLES}>
                  <OrganizerOverview />
                </RequireAuth>
              }
            />
            <Route
              path="/organizer/overview"
              element={
                <RequireAuth roles={ORGANIZER_ROLES}>
                  <OrganizerOverview />
                </RequireAuth>
              }
            />
            <Route
              path="/organizer/events"
              element={
                <RequireAuth roles={ORGANIZER_ROLES}>
                  <OrganizerEventManagementPage />
                </RequireAuth>
              }
            />
            <Route
              path="/organizer/organization"
              element={
                <RequireAuth roles={ORGANIZER_ROLES}>
                  <OrganizerOrganizationManagementPage />
                </RequireAuth>
              }
            />
            <Route
              path="/organizer/volunteers"
              element={
                <RequireAuth roles={ORGANIZER_ROLES}>
                  <OrganizerVolunteersPage />
                </RequireAuth>
              }
            />
            <Route
              path="/organizer/registrations/:id"
              element={
                <RequireAuth roles={ORGANIZER_ROLES}>
                  <OrganizerVolunteerDetails />
                </RequireAuth>
              }
            />

            <Route
              path="/organizer/volunteers/:id/history"
              element={
                <RequireAuth roles={ORGANIZER_ROLES}>
                  <OrganizerVolunteerHistory />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/approvals"
              element={
                <RequireAuth roles={ADMIN_ROLES}>
                  <AdminEventApprovalsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/moderation"
              element={
                <RequireAuth roles={ADMIN_ROLES}>
                  <AdminModerationPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RequireAuth roles={ADMIN_ROLES}>
                  <AdminUsersPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <RequireAuth roles={ADMIN_ROLES}>
                  <AdminCategoriesPage />
                </RequireAuth>
              }
            />
            <Route path="/organizations" element={<OrganizationList />} />
            <Route path="/organizations/:id" element={<OrganizationDetails />} />
            <Route path="/organizations/register" element={<OrganizationRegister />} />
            <Route path="/organizations/success" element={<OrganizationSuccess />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/payment-result" element={<PaymentResultPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/events/register" element={<EventRegisterPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </Router>
  );
}

export default App;
