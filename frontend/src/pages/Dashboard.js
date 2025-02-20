import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid } from "@mui/material";
import BreadcrumbsNav from "../components/BreadcrumbsNav"; // Import the BreadcrumbsNav component
import { PieChart } from '@mui/x-charts/PieChart';

const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Fetch data from the FastAPI backend
    fetch("http://localhost:8000/alerts/")
      .then((response) => response.json())
      .then((data) => setAlerts(data));
  }, []);

  // Calculate the count of rule_broken per status
  const statusCounts = {
    Flagged: 0,
    "Pending for review": 0,
    "Under Investigation": 0,
    "Closed as suspicious": 0,
    "Closed as not suspicious": 0,
    "Source of funds are Genuine. Withdrawal slip from SBI bank verified": 0
  };

  // Sum up the lengths of rule_broken arrays for each status
  alerts.forEach((alert) => {
    const ruleCount = alert.rule_broken ? alert.rule_broken.length : 0; // Compute length of rule_broken array
    if (alert.status === "Flagged") {
      statusCounts.Flagged += ruleCount;
    } else if (alert.status === "Pending for review") {
      statusCounts["Pending for review"] += ruleCount;
    } else if (alert.status === "Under Investigation") {
      statusCounts["Under Investigation"] += ruleCount;
    } else if (alert.status === "Closed as suspicious") {
      statusCounts["Closed as suspicious"] += ruleCount;
    } else if (alert.status === "Closed as not suspicious") {
      statusCounts["Closed as not suspicious"] += ruleCount;
    } else if (alert.status === "Source of funds are Genuine. Withdrawal slip from SBI bank verified") {
      statusCounts["Source of funds are Genuine. Withdrawal slip from SBI bank verified"] += ruleCount;
    } 
  });

  // Prepare the data for the pie chart, filtering out entries where the count is 0
  const filteredPieData = [
    { label: "Flagged", value: statusCounts.Flagged },
    { label: "Review Pending", value: statusCounts["Pending for review"] },
    { label: "Under Investigation", value: statusCounts["Under Investigation"] },
    { label: "Suspicious (Closed)", value: statusCounts["Closed as suspicious"] },
    { label: "Legitimate (Closed)", value: statusCounts["Closed as not suspicious"] },
    { label: "Funding Verified", value: statusCounts["Source of funds are Genuine. Withdrawal slip from SBI bank verified"] },
  ].filter(item => item.value > 0); // Only include items with value greater than 0

  return (
    <Box sx={{ p: 4 }}>
      {/* Use the BreadcrumbsNav component */}
      <BreadcrumbsNav />

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Flash Card
      </Typography>

      {/* Grid to align the cards */}
      <Grid container spacing={3}>
        {/* Flagged Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, textAlign: "center", height: 190, backgroundColor: "#D9EAFD", borderRadius: "8px", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)"  }}>
            <Typography variant="h6" sx={{ color: "black", fontWeight: "bold" }}>Flagged</Typography>
            <Typography variant="h6" sx={{ color: "black", fontWeight: "bold" }}>{statusCounts.Flagged}</Typography> {/* Display the count */}
          </Paper>
        </Grid>

        {/* Pending for review Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, textAlign: "center", height: 190, backgroundColor: "#D9EAFD", borderRadius: "8px", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)"  }}>
            <Typography variant="h6" sx={{ color: "black", fontWeight: "bold" }}>Review Pending</Typography>
            <Typography variant="h6" sx={{ color: "black", fontWeight: "bold" }}>{statusCounts["Pending for review"]}</Typography>
          </Paper>
        </Grid>

        {/* Under Investigation Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, textAlign: "center", height: 190, backgroundColor: "#D9EAFD", borderRadius: "8px", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)"  }}>
            <Typography variant="h6" sx={{ color: "black", fontWeight: "bold" }}>Under Investigation</Typography>
            <Typography variant="h6" sx={{ color: "black", fontWeight: "bold" }}>{statusCounts["Under Investigation"]}</Typography>
          </Paper>
        </Grid>

        {/* Closed as suspicious Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, textAlign: "center", height: 190, backgroundColor: "#D9EAFD", borderRadius: "8px", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)"  }}>
            <Typography variant="h6" sx={{ color: "black", fontWeight: "bold" }}>Suspicious (Closed)</Typography>
            <Typography variant="h6" sx={{ color: "black", fontWeight: "bold" }}>{statusCounts["Closed as suspicious"]}</Typography>
          </Paper>
        </Grid>

        {/* Closed as not suspicious Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, textAlign: "center", height: 190, backgroundColor: "#D9EAFD", borderRadius: "8px", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}>
            <Typography variant="h6" sx={{ color: "black", fontWeight: "bold" }}>Legitimate (Closed)</Typography>
            <Typography variant="h6" sx={{ color: "black", fontWeight: "bold" }}>{statusCounts["Closed as not suspicious"]}</Typography>
          </Paper>
        </Grid>
        
        {/* Funding Verified Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, textAlign: "center", height: 190, backgroundColor: "#D9EAFD", borderRadius: "8px", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)"  }}>
            <Typography variant="h6" sx={{ color: "black", fontWeight: "bold" }}>Funding Verified</Typography>
            <Typography variant="h6" sx={{ color: "black", fontWeight: "bold" }}>{statusCounts["Source of funds are Genuine. Withdrawal slip from SBI bank verified"]}</Typography>
          </Paper>
        </Grid>
      </Grid>
      <br />

      {/* Pie Chart Section */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Charts
      </Typography>
      <br />
      <PieChart
        series={[
          {
            data: filteredPieData, // Use the filtered data
            highlightScope: { fade: 'global', highlight: 'item' },
            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
            label: (point) => `${point.label}: ${point.value}`, // Labels with value
          },
        ]}
        height={200}
      />
    </Box>
  );
};

export default Dashboard;
