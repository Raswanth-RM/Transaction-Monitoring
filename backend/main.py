from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Body
from fastapi import Path
from sqlalchemy import Column, Integer, String, Float, func, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import aiofiles
import os
import json
from pydantic import BaseModel

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# SQLite Database Configuration
DATABASE_URL = "sqlite:///./transactions.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

# Define Transaction Model
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    registration_no = Column(Integer, index=True)
    customer_name = Column(String, index=True)
    transaction_type = Column(String)
    product = Column(String)
    amount = Column(Float)

# Define Alerts Model
class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_name = Column(String, index=True)
    total_amount = Column(Float)
    rule_broken = Column(String)  # Stored as a JSON string
    status = Column(String)

# Create Tables
Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Upload CSV API
@app.post("/upload/")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        if not file.filename.endswith(".csv"):
            raise HTTPException(status_code=400, detail="Only CSV files are allowed")

        # Create temp directory if it doesn't exist
        os.makedirs("./temp", exist_ok=True)
        file_path = f"./temp/{file.filename}"

        # Save uploaded file
        try:
            async with aiofiles.open(file_path, "wb") as buffer:
                content = await file.read()
                await buffer.write(content)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

        # Read and validate CSV
        try:
            df = pd.read_csv(file_path)
            
            # Define column name mappings
            column_mapping = {
                'Registration No': 'registration_no',
                'Customer name': 'customer_name',
                'Type': 'transaction_type',
                'product': 'product',
                'amount': 'amount'
            }
            
            # Rename columns to match expected names
            df = df.rename(columns=column_mapping)
            
            # Remove S.N column if it exists
            if 'S.N' in df.columns:
                df = df.drop('S.N', axis=1)
            
            # Validate required columns
            required_columns = {"registration_no", "customer_name", "transaction_type", "product", "amount"}
            missing_columns = required_columns - set(df.columns)
            if missing_columns:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Missing required columns: {', '.join(missing_columns)}"
                )

            # Validate data types
            try:
                df["amount"] = pd.to_numeric(df["amount"])
                df["registration_no"] = pd.to_numeric(df["registration_no"])
            except ValueError as e:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid data types: 'amount' and 'registration_no' must be numeric"
                )

            # Store in database
            for _, row in df.iterrows():
                transaction = Transaction(
                    registration_no=int(row["registration_no"]),
                    customer_name=str(row["customer_name"]),
                    transaction_type=str(row["transaction_type"]),
                    product=str(row["product"]),
                    amount=float(row["amount"]),
                )
                db.add(transaction)
            db.commit()

        except pd.errors.EmptyDataError:
            raise HTTPException(status_code=400, detail="The CSV file is empty")
        except pd.errors.ParserError as e:
            raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")
        finally:
            # Clean up temporary file
            if os.path.exists(file_path):
                os.remove(file_path)

    except Exception as e:
        # Log the full error for debugging
        print(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "File uploaded and data stored successfully"}
# Get Transactions API
@app.get("/transactions/")
def get_transactions(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).all()
    return transactions

# Get all transactions for a specific customer
@app.get("/transactions/{customer_name}")
def get_customer_transactions(customer_name: str, db: Session = Depends(get_db)):
    transactions = db.query(Transaction).filter(Transaction.customer_name == customer_name).all()
    return transactions

# Rule Breakers API (also inserts data into alerts table)
@app.get("/rule_breakers/")
def get_rule_breakers(db: Session = Depends(get_db)):
    # Get total transactions per customer
    transaction_counts = (
        db.query(Transaction.customer_name, func.count(Transaction.id).label("transaction_count"))
        .group_by(Transaction.customer_name)
        .all()
    )

    # Get total spending per customer
    total_spent = (
        db.query(Transaction.customer_name, func.sum(Transaction.amount).label("total_amount"))
        .group_by(Transaction.customer_name)
        .all()
    )

    # Get customers with a single transaction ≥ 55000
    single_large_txn = (
        db.query(Transaction.customer_name, Transaction.amount)
        .filter(Transaction.amount >= 55000)
        .all()
    )

    rule_breakers = {}

    # Check Rule 1: Customers with 3+ transactions
    for cust_name, txn_count in transaction_counts:
        if txn_count >= 3:
            if cust_name not in rule_breakers:
                rule_breakers[cust_name] = {
                    "customer_name": cust_name,
                    "total_amount": 0,  
                    "rule_broken": [],
                    "status": "Flagged",
                }
            rule_breakers[cust_name]["rule_broken"].append("Frequent Transactions (≥3 times)")

    # Check Rule 2: Customers who spent more than 55000
    for cust_name, total_amount in total_spent:
        if total_amount > 55000:
            if cust_name not in rule_breakers:
                rule_breakers[cust_name] = {
                    "customer_name": cust_name,
                    "total_amount": total_amount,
                    "rule_broken": [],
                    "status": "Flagged",
                }
            rule_breakers[cust_name]["rule_broken"].append("Total Amount > 55000")
            rule_breakers[cust_name]["total_amount"] = total_amount  

    # Check Rule 3: Customers with a single transaction ≥ 55000
    for cust_name, amount in single_large_txn:
        if cust_name not in rule_breakers:
            rule_breakers[cust_name] = {
                "customer_name": cust_name,
                "total_amount": amount,
                "rule_broken": [],
                "status": "Flagged",
            }
        rule_breakers[cust_name]["rule_broken"].append("Single Transaction ≥ 55000")

    # Convert rule_broken list to JSON string & Insert/Update alerts table
    for cust in rule_breakers.values():
        cust["rule_broken"] = list(set(cust["rule_broken"]))  # Remove duplicates
        rule_broken_json = json.dumps(cust["rule_broken"])

        # Check if the customer already exists in alerts
        existing_alert = db.query(Alert).filter(Alert.customer_name == cust["customer_name"]).first()

        if existing_alert:
            # Update existing alert if rules have changed
            if existing_alert.rule_broken != rule_broken_json or existing_alert.total_amount != cust["total_amount"]:
                existing_alert.total_amount = cust["total_amount"]
                existing_alert.rule_broken = rule_broken_json
                existing_alert.status = cust["status"]
        else:
            # Insert new alert
            db.add(Alert(
                customer_name=cust["customer_name"],
                total_amount=cust["total_amount"],
                rule_broken=rule_broken_json,
                status=cust["status"]
            ))

    db.commit()

    return list(rule_breakers.values())


# Get rule breaker for a specific customer
@app.get("/rule_breakers/{customer_name}")
def get_rule_breaker(customer_name: str, db: Session = Depends(get_db)):
    all_breakers = get_rule_breakers(db)
    user_breaker = next((b for b in all_breakers if b["customer_name"] == customer_name), None)
    if not user_breaker:
        raise HTTPException(status_code=404, detail="User not found in rule breakers")
    return user_breaker

# Get all alerts stored in the database
@app.get("/alerts/")
def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).all()
    return [{"customer_name": a.customer_name, "total_amount": a.total_amount, "rule_broken": json.loads(a.rule_broken), "status": a.status} for a in alerts]

@app.get("/alerts/{customer_name}")
def get_customer_alert(customer_name: str, db: Session = Depends(get_db)):
    # First check if the alert exists in the alerts table
    alert = db.query(Alert).filter(Alert.customer_name == customer_name).first()
    
    if not alert:
        # If no alert exists, return 404
        raise HTTPException(status_code=404, detail=f"No alerts found for customer: {customer_name}")
    
    # Convert the rule_broken JSON string back to a list
    rule_broken = json.loads(alert.rule_broken) if alert.rule_broken else []
    
    return {
        "customer_name": alert.customer_name,
        "total_amount": alert.total_amount,
        "rule_broken": rule_broken,
        "status": alert.status
    }

# Define a Pydantic model for status_data
class StatusData(BaseModel):
    status: str

@app.post("/update_alert_status/{customer_name}")
def update_alert_status(
    customer_name: str = Path(...),
    status_data: StatusData = Body(...),  # Expecting the request body to contain 'status' field
    db: Session = Depends(get_db)
):
    # Log status_data for debugging
    print("Status Data:", status_data.dict())

    # Find the alert entry by customer name
    alert_entry = db.query(Alert).filter(Alert.customer_name == customer_name).first()
    
    if not alert_entry:
        raise HTTPException(status_code=404, detail="Alert not found")

    # Update status
    new_status = status_data.status  # Accessing the 'status' from the parsed body
    alert_entry.status = new_status
    db.commit()
    return {"message": "Status updated successfully"}
