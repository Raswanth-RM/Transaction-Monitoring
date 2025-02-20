import * as React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SendIcon from "@mui/icons-material/Send";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

// Hide default file input
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [transactions, setTransactions] = React.useState([]); // Store transaction data

  // Fetch transactions from API
  const fetchTransactions = async () => {
    try {
      const response = await axios.get("http://localhost:8000/transactions/");
      setTransactions(response.data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions.");
    }
  };

  // Handle File Selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setSelectedFile(file);
        setError("");
        setMessage("");
      } else {
        setSelectedFile(null);
        setError("Only CSV files are allowed!");
      }
    }
  };

  // Handle File Upload
  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError("Please select a CSV file before sending.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://localhost:8000/upload/", formData, {
        headers: { 
          "Content-Type": "multipart/form-data"
        },
      });

      if (response.status === 200) {
        setMessage("File uploaded successfully!");
        setError(""); 
        setSelectedFile(null);
        fetchTransactions();
      }
    } catch (err) {
      console.error("Upload error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Set more specific error message
      if (err.response?.data?.detail) {
        setError(`Upload failed: ${err.response.data.detail}`);
      } else {
        setError("Error uploading file. Please check the server.");
      }
    }
  };
  // Define columns for DataGrid
  const columns = [
    { field: "id", headerName: "S.No", width: 90 },
    { field: "registration_no", headerName: "Registration No", width: 150 },
    { field: "customer_name", headerName: "Customer Name", width: 200 },
    { field: "transaction_type", headerName: "Type", width: 150 },
    { field: "product", headerName: "Product", width: 200 },
    { field: "amount", headerName: "Amount", width: 120 },
  ];

  // Fetch transactions on component mount
  React.useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h4" fontWeight="bold">File Upload</Typography>
      <Typography>Upload your transaction records for monitoring.</Typography>


      {/* File Upload Section */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          textAlign: "center",
          border: "2px dashed #7579FF",
          borderRadius: 2,
          bgcolor: "#f4f4f4",
          position: "relative",
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 50, color: "#7579FF" }} />
        <Typography variant="h6" sx={{ mt: 1, mb: 2, color:"black"}}>
          Drag & Drop a file here or click to upload
        </Typography>

        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          sx={{ bgcolor: "#7579FF", "&:hover": { bgcolor: "#454ADE" } }}
        >
          Choose File
          <VisuallyHiddenInput type="file" onChange={handleFileChange} accept=".csv" />
        </Button>

        {selectedFile && (
          <Typography sx={{ mt: 2, fontStyle: "italic" }}>
            Selected file: {selectedFile.name}
          </Typography>
        )}

        {error && (
          <Typography sx={{ mt: 2, color: "red", fontWeight: "bold" }}>
            {error}
          </Typography>
        )}
        {message && (
          <Typography sx={{ mt: 2, color: "green", fontWeight: "bold" }}>
            {message}
          </Typography>
        )}

        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={handleFileUpload}
          sx={{ position: "absolute", bottom: 10, right: 10, bgcolor: "#7579FF", "&:hover": { bgcolor: "#454ADE" } }}
        >
          Send
        </Button>
      </Paper>

      {/* Transactions Table */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Transaction Records
        </Typography>
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={transactions}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 15]}
            disableSelectionOnClick
          />
        </div>
      </Paper>
    </Box>
  );
};

export default FileUpload;
