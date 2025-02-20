import React from "react";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";

const BreadcrumbsNav = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Check if the current page is "alerts" or "dashboard"
  const isBlackBreadcrumb = pathnames.includes("alerts") || pathnames.includes("dashboard");

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
      <Link
        component={RouterLink}
        to="/"
        underline="hover"
        sx={{ color: "white", fontWeight: "bold" }} // Set breadcrumb color to white
      >
        Home
      </Link>
      {pathnames.map((value, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return isLast ? (
          <Typography
            key={value}
            sx={{
              color: "white", // Set breadcrumb color to white for last item
              fontWeight: "bold",
            }}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Typography>
        ) : (
          <Link
            key={value}
            component={RouterLink}
            to={routeTo}
            underline="hover"
            sx={{
              color: "#F8F5E9", // Set breadcrumb color to white for non-last items
              fontWeight: "bold",
            }}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default BreadcrumbsNav;
