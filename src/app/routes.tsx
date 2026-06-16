import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { TeacherLogin } from "./pages/TeacherLogin";
import { StudentLogin } from "./pages/StudentLogin";
import { TeacherSetup } from "./pages/TeacherSetup";
import { StudentSetup } from "./pages/StudentSetup";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { StudentDashboard } from "./pages/StudentDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/teacher/login",
    Component: TeacherLogin,
  },
  {
    path: "/student/login",
    Component: StudentLogin,
  },
  {
    path: "/teacher/setup",
    Component: TeacherSetup,
  },
  {
    path: "/student/setup",
    Component: StudentSetup,
  },
  {
    path: "/teacher",
    Component: TeacherDashboard,
  },
  {
    path: "/student",
    Component: StudentDashboard,
  },
]);
