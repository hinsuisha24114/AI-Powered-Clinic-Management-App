# Billing System Implementation Guide

## Overview
The billing system has been completely revamped with full backend and frontend integration, providing a complete billing management solution with patient selection, bill creation, tracking, and payment status management.

## Backend Changes

### 1. Database Model Updates (`backend/app/models.py`)
Added `description` field to the `Bill` model for better tracking of services:
```python
class Bill(Base):
    __tablename__ = "billing"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)  # NEW FIELD
    status = Column(String, default="unpaid")
    created_at = Column(DateTime, default=datetime.utcnow)
    patient = relationship("Patient", back_populates="bills")
```

### 2. Pydantic Schemas (`backend/app/schemas.py`)
Enhanced billing schemas for better validation and response handling:

**BillCreate** - For creating new bills
```python
class BillCreate(BaseModel):
    patient_id: int
    amount: float
    description: Optional[str] = None
    status: Optional[str] = "unpaid"
```

**BillUpdate** - For updating bill status/amount
```python
class BillUpdate(BaseModel):
    status: Optional[str] = None
    amount: Optional[float] = None
```

**BillResponse** - Complete bill information
```python
class BillResponse(BaseModel):
    id: int
    patient_id: int
    amount: float
    description: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
```

### 3. Backend Router (`backend/app/routers/billing.py`)
Complete CRUD operations:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/billing/` | Create new bill |
| GET | `/api/billing/` | Get all bills |
| GET | `/api/billing/{bill_id}` | Get specific bill |
| GET | `/api/billing/patient/{patient_id}` | Get all bills for a patient |
| PUT | `/api/billing/{bill_id}` | Update bill status/amount |
| DELETE | `/api/billing/{bill_id}` | Delete bill |

**Features:**
- Patient existence validation
- Error handling with proper HTTP status codes
- Full CRUD operations
- Proper response models

## Frontend Changes

### 1. API Service (`frontend/src/services/api.js`)
Added comprehensive billing API functions:

```javascript
export const createBill = (data) => API.post("/billing", data)
export const getAllBills = () => API.get("/billing")
export const getBillsByPatient = (patientId) => API.get(`/billing/patient/${patientId}`)
export const getBillById = (billId) => API.get(`/billing/${billId}`)
export const updateBill = (billId, data) => API.put(`/billing/${billId}`, data)
export const deleteBill = (billId) => API.delete(`/billing/${billId}`)
```

### 2. Billing Component (`frontend/src/pages/Billing.jsx`)
Complete rewrite with following features:

**Core Functionality:**
- ✅ Patient selection dropdown (loads from database)
- ✅ Create bills with description, amount
- ✅ View all bills for selected patient
- ✅ Mark bills as paid/unpaid
- ✅ Delete bills
- ✅ Real-time bill summaries

**Features:**
- Error handling and user feedback
- Loading states
- Bill summaries showing:
  - Total amount
  - Paid amount
  - Pending (unpaid) amount
- Sortable bill table with:
  - Bill ID
  - Description
  - Amount
  - Date created
  - Payment status
  - Action buttons

**State Management:**
```javascript
- patients: Patient list from database
- selectedPatientId: Current patient selection
- bills: Patient's bills
- loading: Loading state for async operations
- error: Error messages
- success: Success messages
```

### 3. Styling (`frontend/src/pages/Billing.css`)
Complete redesign with:
- Professional grid layout
- Responsive design (mobile-friendly)
- Color-coded payment status badges
- Summary cards with gradients
- Styled forms and buttons
- Table styling with hover effects
- Alert messages (error/success)
- Accessibility improvements

## API Integration Flow

### Creating a Bill
1. User selects patient from dropdown
2. Fills in service description and amount
3. Clicks "Create Bill" button
4. Frontend validates form data
5. POST request sent to `/api/billing/`
6. Backend validates patient exists
7. Bill stored in database
8. Response returned with bill details
9. UI updates with new bill in the list

### Viewing Bills
1. Patient selection triggers automatic bill fetch
2. GET request to `/api/billing/patient/{patient_id}`
3. Backend returns all bills for patient
4. UI displays bills in formatted table
5. Summary cards auto-calculate totals

### Updating Bill Status
1. User clicks "Mark Paid" or "Mark Unpaid" button
2. PUT request sent to `/api/billing/{bill_id}` with new status
3. Backend updates bill status
4. UI updates bill list with new status
5. Summary cards recalculate automatically

### Deleting a Bill
1. User clicks delete button (confirmation prompt)
2. DELETE request sent to `/api/billing/{bill_id}`
3. Backend deletes bill from database
4. UI removes bill from list
5. Summary cards update

## Database Schema

The Bill table structure:
```sql
CREATE TABLE billing (
    id INTEGER PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    amount FLOAT NOT NULL,
    description VARCHAR,
    status VARCHAR DEFAULT 'unpaid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

## Error Handling

**Backend Validation:**
- Patient existence check (404 if not found)
- Required field validation
- Type validation through Pydantic

**Frontend Feedback:**
- Alert messages for errors
- Success messages for operations
- Loading indicators during API calls
- Confirmation dialogs for destructive actions

## Testing the Implementation

### Prerequisites
1. Backend running: `python run.py`
2. Frontend running: `npm run dev`
3. Database populated with patients

### Manual Test Cases

1. **Create Bill:**
   - Select a patient
   - Enter service description
   - Enter amount
   - Click "Create Bill"
   - Verify bill appears in table

2. **View Patient Bills:**
   - Select different patients
   - Verify bills change per patient
   - Verify summary cards update

3. **Update Status:**
   - Click "Mark Paid" button
   - Verify status changes to "PAID"
   - Verify summary cards update totals

4. **Delete Bill:**
   - Click delete button
   - Confirm deletion
   - Verify bill is removed from table

## Features Summary

| Feature | Status | Details |
|---------|--------|---------|
| Create Bills | ✅ Implemented | Full form with validation |
| View Bills | ✅ Implemented | Patient-specific view with table |
| Update Status | ✅ Implemented | Toggle between paid/unpaid |
| Delete Bills | ✅ Implemented | With confirmation |
| Summaries | ✅ Implemented | Total, paid, pending calculations |
| Patient Selection | ✅ Implemented | Dynamic dropdown from database |
| Error Handling | ✅ Implemented | User-friendly messages |
| Responsive Design | ✅ Implemented | Mobile-friendly interface |
| Data Persistence | ✅ Implemented | Fully database-backed |

## Future Enhancements

Potential improvements:
- Payment method tracking
- Invoice PDF generation
- Email bill notifications
- Bulk bill operations
- Advanced filtering/search
- Payment history
- Finance reports
- Bill reminders

## Notes

- The system uses automatic table creation from SQLAlchemy models
- No migration files are needed for initial setup
- All timestamps are in UTC
- Status values: "paid" or "unpaid"
- Descriptions are optional but recommended
