import * as React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Outlet } from "react-router-dom";

const NAVIGATION = [
  { segment: "dashboard", title: "Dashboard", icon: <DashboardIcon /> },
  { segment: "alerts", title: "Alerts", icon: <ErrorOutlineIcon /> },
  { segment: "fileupload", title: "File Upload", icon: <CloudUploadIcon /> },

];

const theme = createTheme({
  palette: {
    mode: "dark", // Fixed to Light Theme
  },
});

const Layout = () => {
  return (
    <ThemeProvider theme={theme}>
      <AppProvider
        navigation={NAVIGATION}
        theme={theme}
        branding={{
          title: "Winnow Management Solutions",
        }}
      >
        <DashboardLayout>
          <Outlet /> {/* This will render the current route's content */}
        </DashboardLayout>
      </AppProvider>
    </ThemeProvider>
  );
};

export default Layout;
