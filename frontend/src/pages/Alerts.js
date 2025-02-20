import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../components/BreadcrumbsNav"; // Import Breadcrumbs

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/alerts/")
      .then((res) => res.json())
      .then((data) => setAlerts(data))
      .catch((error) => console.error("Error fetching alerts:", error));
  }, []);

  const columns = [
    { field: "customer_name", headerName: "Customer Name", width: 200 },
    { field: "total_amount", headerName: "Total Amount", width: 150 },
    {
      field: "rule_broken",
      headerName: "Alerts", // Changed from "Rule Broken" to "Alerts"
      width: 300,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{ whiteSpace: "normal", wordWrap: "break-word", overflow: "hidden" }}
        >
          {params.value}
        </Typography>
      ),
    },
    { field: "status", headerName: "Status", width: 120 },
  ];
  

  return (
    <Box sx={{ p: 3 }}>
      <BreadcrumbsNav /> {/* Include Breadcrumbs */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Alerts
      </Typography>
      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={alerts.map((row, index) => ({ id: index, ...row }))}
          columns={columns}
          pageSize={5}
          onRowClick={(params) => navigate(`/alerts/${params.row.customer_name}`)}
        />
      </Box>
    </Box>
  );
};

export default Alerts;
