# API Workflow Guide - Procurement Management System

This document provides a complete step-by-step walkthrough of the procurement management system using curl commands.

## Prerequisites

- Server running on `http://localhost:8000`
- Database seeded with an admin user

---

## Step 1: Admin Login

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "admin-uuid-123",
      "email": "admin@example.com",
      "phone": null,
      "role": "ADMIN",
      "name": "System Admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token:** `ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`

---

## Step 2: Admin Creates Procurement Manager

**Request:**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "pm@example.com",
    "password": "pm123456",
    "role": "PROCUREMENT_MANAGER",
    "name": "John PM"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "pm-uuid-456",
    "email": "pm@example.com",
    "role": "PROCUREMENT_MANAGER"
  }
}
```

---

## Step 3: Admin Creates Client

**Request:**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "client@example.com",
    "password": "client123",
    "role": "CLIENT",
    "name": "ABC Corporation"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "client-uuid-789",
    "email": "client@example.com",
    "role": "CLIENT"
  }
}
```

---

## Step 4: Admin Creates Inspection Manager

**Request:**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "phone": "9876543210",
    "password": "im123456",
    "role": "INSPECTION_MANAGER",
    "name": "Mike IM"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "im-uuid-101",
    "phone": "9876543210",
    "role": "INSPECTION_MANAGER"
  }
}
```

**Save the IM ID:** `IM_ID="im-uuid-101"`

---

## Step 5: Admin Assigns IM to PM

**Request:**
```bash
curl -X PUT http://localhost:3000/api/users/assign-pm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "userId": "im-uuid-101",
    "assignedPMId": "pm-uuid-456"
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Procurement Manager assigned successfully"
}
```

---

## Step 6: PM Login

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pm@example.com",
    "password": "pm123456"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "pm-uuid-456",
      "email": "pm@example.com",
      "role": "PROCUREMENT_MANAGER",
      "name": "John PM"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token:** `PM_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`

---

## Step 7: PM Creates Checklist Template

**Request:**
```bash
curl -X POST http://localhost:3000/api/checklists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PM_TOKEN" \
  -d '{
    "name": "Vehicle Transport Checklist",
    "clientId": "client-uuid-789",
    "source": "CLIENT",
    "questions": [
      {
        "key": "cooler_present",
        "label": "Cooler present in vehicle?",
        "type": "BOOLEAN",
        "required": true,
        "orderIndex": 1
      },
      {
        "key": "cargo_category",
        "label": "Select cargo category",
        "type": "DROPDOWN",
        "required": true,
        "options": ["Eatable", "Drinkable", "Medicine"],
        "orderIndex": 2
      },
      {
        "key": "driver_details",
        "label": "Driver compliance checks",
        "type": "MULTI_SELECT",
        "required": true,
        "options": ["License present", "Driver number active", "Air pressure good"],
        "orderIndex": 3
      },
      {
        "key": "before_loading_image",
        "label": "Image before loading",
        "type": "IMAGE_UPLOAD",
        "required": true,
        "orderIndex": 4
      },
      {
        "key": "after_loading_image",
        "label": "Image after loading",
        "type": "IMAGE_UPLOAD",
        "required": true,
        "orderIndex": 5
      },
      {
        "key": "overall_summary",
        "label": "Overall inspection summary",
        "type": "TEXT",
        "required": false,
        "orderIndex": 6
      }
    ]
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "template": {
      "id": "checklist-uuid-202",
      "name": "Vehicle Transport Checklist",
      "clientId": "client-uuid-789",
      "source": "CLIENT",
      "version": 1,
      "isActive": true
    }
  }
}
```

**Save the checklist ID:** `CHECKLIST_ID="checklist-uuid-202"`

---

## Step 8: PM Creates Order

**Request:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PM_TOKEN" \
  -d '{
    "title": "Medicine Delivery to Hospital A",
    "clientId": "client-uuid-789",
    "checklistTemplateId": "checklist-uuid-202",
    "inspectionManagerId": "im-uuid-101"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "order": {
      "id": "order-uuid-303",
      "title": "Medicine Delivery to Hospital A",
      "orderNumber": "ckxyz123abc",
      "status": "PENDING",
      "clientId": "client-uuid-789",
      "pmId": "pm-uuid-456",
      "imId": "im-uuid-101",
      "checklistTemplateId": "checklist-uuid-202",
      "checklistSnapshot": { }
    }
  }
}
```

**Save the order ID:** `ORDER_ID="order-uuid-303"`

---

## Step 9: IM Login

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "password": "im123456"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "im-uuid-101",
      "phone": "9876543210",
      "role": "INSPECTION_MANAGER",
      "name": "Mike IM"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token:** `IM_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`

---

## Step 10: IM Views Order Details

**Request:**
```bash
curl -X GET http://localhost:3000/api/orders/order-uuid-303 \
  -H "Authorization: Bearer $IM_TOKEN"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "order": {
      "id": "order-uuid-303",
      "title": "Medicine Delivery to Hospital A",
      "status": "PENDING",
      "checklistSnapshot": {
        "questions": []
      }
    }
  }
}
```

---

## Step 11: IM Uploads Images

### Upload Before Loading Image
**Request:**
```bash
curl -X POST http://localhost:3000/api/uploads \
  -H "Authorization: Bearer $IM_TOKEN" \
  -F "file=@/path/to/before_loading.jpg"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "url": "http://localhost:3000/uploads/before-1234567890.jpg",
    "filename": "before-1234567890.jpg"
  }
}
```

**Save:** `BEFORE_IMAGE_URL="http://localhost:3000/uploads/before-1234567890.jpg"`

### Upload After Loading Image
**Request:**
```bash
curl -X POST http://localhost:3000/api/uploads \
  -H "Authorization: Bearer $IM_TOKEN" \
  -F "file=@/path/to/after_loading.jpg"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "url": "http://localhost:3000/uploads/after-9876543210.jpg",
    "filename": "after-9876543210.jpg"
  }
}
```

**Save:** `AFTER_IMAGE_URL="http://localhost:3000/uploads/after-9876543210.jpg"`

---

## Step 12: IM Submits Draft Checklist

**Request:**
```bash
curl -X POST http://localhost:3000/api/orders/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $IM_TOKEN" \
  -d '{
    "orderId": "order-uuid-303",
    "isFinal": false,
    "answers": {
      "cooler_present": true,
      "cargo_category": "Medicine",
      "driver_details": ["License present", "Driver number active"],
      "before_loading_image": "http://localhost:3000/uploads/before-1234567890.jpg",
      "after_loading_image": "http://localhost:3000/uploads/after-9876543210.jpg",
      "overall_summary": "Partial inspection - waiting for final checks"
    }
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "submission": {
      "id": "submission-uuid-404",
      "orderId": "order-uuid-303",
      "isFinal": false,
      "answers": {}
    }
  }
}
```

---

## Step 13: IM Updates Order Status to IN_PROGRESS

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/orders/order-uuid-303/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $IM_TOKEN" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "order": {
      "id": "order-uuid-303",
      "status": "IN_PROGRESS"
    }
  }
}
```

---

## Step 14: IM Submits Final Checklist

**Request:**
```bash
curl -X POST http://localhost:3000/api/orders/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $IM_TOKEN" \
  -d '{
    "orderId": "order-uuid-303",
    "isFinal": true,
    "answers": {
      "cooler_present": true,
      "cargo_category": "Medicine",
      "driver_details": ["License present", "Driver number active", "Air pressure good"],
      "before_loading_image": "http://localhost:3000/uploads/before-1234567890.jpg",
      "after_loading_image": "http://localhost:3000/uploads/after-9876543210.jpg",
      "overall_summary": "All checks completed successfully. Vehicle is ready for transport."
    }
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "submission": {
      "id": "submission-uuid-505",
      "orderId": "order-uuid-303",
      "isFinal": true,
      "answers": {}
    }
  }
}
```

---

## Step 15: IM Updates Order Status to INSPECTION_COMPLETED

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/orders/order-uuid-303/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $IM_TOKEN" \
  -d '{
    "status": "INSPECTION_COMPLETED"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "order": {
      "id": "order-uuid-303",
      "status": "INSPECTION_COMPLETED"
    }
  }
}
```

---

## Step 16: PM Reviews Submissions

**Request:**
```bash
curl -X GET http://localhost:3000/api/orders/order-uuid-303/submissions \
  -H "Authorization: Bearer $PM_TOKEN"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "submissions": [
      {
        "id": "submission-uuid-404",
        "isFinal": false,
        "createdAt": "2025-12-23T07:00:00Z"
      },
      {
        "id": "submission-uuid-505",
        "isFinal": true,
        "createdAt": "2025-12-23T08:00:00Z"
      }
    ]
  }
}
```

---

## Step 17: PM Updates Order Status to COMPLETED

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/orders/order-uuid-303/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PM_TOKEN" \
  -d '{
    "status": "COMPLETED"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "order": {
      "id": "order-uuid-303",
      "status": "COMPLETED"
    }
  }
}
```

---

## Step 18: Client Views Order Status

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "password": "client123"
  }'
```

**Save CLIENT_TOKEN then view order:**
```bash
curl -X GET http://localhost:3000/api/orders/order-uuid-303 \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "order": {
      "id": "order-uuid-303",
      "title": "Medicine Delivery to Hospital A",
      "orderNumber": "ckxyz123abc",
      "status": "COMPLETED",
      "client": {
        "name": "ABC Corporation"
      }
    }
  }
}
```

---

## Verification Checklist

- ✅ Admin can create all user types
- ✅ Admin can assign/unassign IM to PM
- ✅ PM can create checklists with multiple question types
- ✅ PM can create orders with checklist
- ✅ IM can login with phone number
- ✅ IM can submit draft and final checklist answers
- ✅ Images are uploaded and linked to answers
- ✅ Multiple users can update order status
- ✅ Client can view order status
- ✅ Checklist updates don't affect existing orders (snapshot)
