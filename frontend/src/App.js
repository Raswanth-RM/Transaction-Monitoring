import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Fileupload from "./pages/Fileupload";
import Alerts from "./pages/Alerts";
import UserAlerts from "./pages/UserAlerts"; 
import Dashboard from "./pages/Dashboard"; // Import Dashboard Page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} /> {/* Default to Dashboard */}
          <Route path="fileupload" element={<Fileupload />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="dashboard" element={<Dashboard />} /> {/* Dashboard Route */}
          <Route path="alerts/:username" element={<UserAlerts />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
