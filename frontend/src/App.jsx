import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Home from "./components/home";
import ProfilePage from "./components/ProfilePage";
import MovieHome from "./Movie/MovieHome";
import MovieService from "./Movie/MovieService";
import MovieForm from "./Movie/MovieForm";
import ProtectedRoute from "./components/ProtectedRoute";
import MovieDetails from "./Movie/MovieDetails";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import MovieReviews from "./Movie/MovieReviews";
import MovieReviewStatistics from "./Movie/MovieReviewStaticstics";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        {/* <Route path="/admin/approve-producers" element={<ApproveProducers />} />   */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/MovieHome" element={<MovieHome />} />
          <Route path="/MovieService" element={<MovieService />} />
          <Route path="/MovieForm" element={<MovieForm />} />
          <Route path="/MovieForm/:id" element={<MovieForm />} />
          <Route path="/MovieDetails/:id" element={<MovieDetails />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/MovieReviews/:id" element={<MovieReviews />} />
          <Route
            path="/MovieReviewStats/:id"
            element={<MovieReviewStatistics />}
          />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
