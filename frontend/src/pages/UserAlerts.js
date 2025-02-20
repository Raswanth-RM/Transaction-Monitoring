import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Paper, MenuItem, Select, FormControl, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import BreadcrumbsNav from "../components/BreadcrumbsNav";

const UserAlerts = () => {
  const { username } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [alertCount, setAlertCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(""); 
  const [updating, setUpdating] = useState(false); 


  useEffect(() => {
    const fetchData = async () => {
      try {
        // First fetch transactions
        const transactionsRes = await fetch(`http://localhost:8000/transactions/${username}`);
        if (!transactionsRes.ok) {
          throw new Error(`Failed to fetch transactions: ${transactionsRes.statusText}`);
        }
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData);

        // Then fetch alerts
        const alertsRes = await fetch(`http://localhost:8000/alerts/${username}`);
        if (!alertsRes.ok) {
          if (alertsRes.status === 404) {
            // Handle case where user has no alerts
            setAlerts([]);
            setStatus("No Alerts");
            setAlertCount(0);
            return;
          }
          throw new Error(`Failed to fetch alerts: ${alertsRes.statusText}`);
        }
        
        const alertData = await alertsRes.json();
        console.log("Alert data received:", alertData);
        
        if (alertData) {
          setAlerts([alertData]);
          const alertStatus = alertData.status?.trim() || "Flagged";
          setStatus(alertStatus);
          
          // Set alert count based on status
          if (alertStatus === "Closed as not suspicious" || 
              alertStatus === "Source of funds are Genuine. Withdrawal slip from SBI bank verified") {
            setAlertCount(0);
          } else {
            setAlertCount(alertData.rule_broken ? alertData.rule_broken.length : 0);
          }
        }

      } catch (err) {
        console.error("Error in fetchData:", err);
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return (
    <Box sx={{ p: 3 }}>
      <BreadcrumbsNav />
      <Typography color="error" variant="h6">{error}</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Please try again later or contact support if the problem persists.
      </Typography>
    </Box>
  );
  

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  const userAlert = alerts.length > 0 ? alerts[0] : null;

  let totalTransactions = transactions.length;
  let totalAmount = transactions.reduce((sum, txn) => sum + txn.amount, 0);
  let transactionsAbove55k = transactions.filter(txn => txn.amount > 55000).length;

  const alertColumns = [
    { field: "total_transactions", headerName: "Total No. of Transactions", width: 200 },
    { field: "total_amount", headerName: "Total Transaction Amount", width: 250 },
    { field: "transactions_above_55k", headerName: "Single Transaction > 55000", width: 250 },
    { field: "status", headerName: "Status", width: 200 },
  ];

  const alertRows = userAlert
    ? [
        {
          id: userAlert.customer_name,
          total_transactions: userAlert.rule_broken.includes("Frequent Transactions (≥3 times)") ? totalTransactions : null,
          total_amount: userAlert.rule_broken.includes("Total Amount > 55000") ? totalAmount : null,
          transactions_above_55k: userAlert.rule_broken.includes("Single Transaction ≥ 55000") ? transactionsAbove55k : null,
          status: status, 
        },
      ]
    : [];

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleSubmitStatus = async () => {
    setUpdating(true);

    try {
      const response = await fetch(`http://localhost:8000/update_alert_status/${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      alert("Status updated successfully!");

      setAlerts((prevAlerts) =>
        prevAlerts.map((alert) => ({
          ...alert,
          status: status,
        }))
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating status!");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <BreadcrumbsNav />
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Alerts for {username}
      </Typography>
      <Typography variant="h6" sx={{ mb: 2, color: "#FF6363" }}>
        Total No. of Alerts: {alertCount}
      </Typography>

      {userAlert && alertRows.length > 0 && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Alerts
          </Typography>
          <Box sx={{ height: 200, width: "100%" }}>
            <DataGrid rows={alertRows} columns={alertColumns} getRowId={(row) => row.id} />
          </Box>
        </Paper>
      )}

      {userAlert && (
        <Paper sx={{ p: 3, mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: "#155E95" }} gutterBottom>
            Update Status
          </Typography>
          <FormControl sx={{ minWidth: 300, mr: 2 }}>
            <Select value={status} onChange={handleStatusChange}>
              <MenuItem value="Flagged">Flagged</MenuItem>
              <MenuItem value="Pending for review">Pending for review</MenuItem>
              <MenuItem value="Under Investigation">Under Investigation</MenuItem>
              <MenuItem value="Closed as suspicious">Closed as suspicious</MenuItem>
              <MenuItem value="Closed as not suspicious">Closed as not suspicious</MenuItem>
              <MenuItem value="Source of funds are Genuine. Withdrawal slip from SBI bank verified">Source of funds are Genuine. Withdrawal slip from SBI bank verified</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={handleSubmitStatus} disabled={updating}>
            {updating ? "Updating..." : "Submit"}
          </Button>
        </Paper>
      )}

      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Transaction Records
        </Typography>
        <Box sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={transactions.map((row) => ({ id: row.registration_no, ...row }))}
            columns={[
              { field: "id", headerName: "Registration No.", width: 150 },
              { field: "customer_name", headerName: "Customer Name", width: 200 },
              { field: "transaction_type", headerName: "Type", width: 120 },
              { field: "product", headerName: "Product", width: 200 },
              { field: "amount", headerName: "Amount", width: 150 },
            ]}
            pageSize={5}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default UserAlerts;
