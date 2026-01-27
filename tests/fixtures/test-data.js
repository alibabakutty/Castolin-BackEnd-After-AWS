// tests/fixtures/test-data.js

export default {
  customers: {
    validCustomer: {
      CUSTOMER_CODE: 9999,
      CUSTOMER_NAME: 'Test Customer',
      MOBILE_NUMBER: '9876543210',
      STATE: 'Test State',
      EMAIL: 'test@example.com',
      PASSWORD: 'Test@123',
      CUSTOMER_TYPE: 'direct',
      ROLE: 'direct',
      STATUS: 'active',
      PARENT_GROUP: 'Sundry Debtors'
    },
    distributorCustomer: {
      CUSTOMER_CODE: 9998,
      CUSTOMER_NAME: 'Test Distributor',
      MOBILE_NUMBER: '9876543211',
      STATE: 'Delhi',
      EMAIL: 'distributor@test.com',
      CUSTOMER_TYPE: 'distributor',
      ROLE: 'distributor',
      STATUS: 'active'
    }
  },
  
  orders: {
    validOrder: {
      ORDER_NUMBER: 'ORD-001',
      CUSTOMER_CODE: 1100,
      ORDER_DATE: new Date().toISOString(),
      TOTAL_AMOUNT: 15000.50,
      STATUS: 'pending',
      ITEMS: [
        {
          ITEM_CODE: 'ITEM001',
          QUANTITY: 10,
          UNIT_PRICE: 1500.05
        }
      ]
    }
  },
  
  stockItems: {
    validItem: {
      ITEM_CODE: 'TEST001',
      ITEM_NAME: 'Test Product',
      CATEGORY: 'Test Category',
      UNIT_PRICE: 100.00,
      STOCK_QUANTITY: 100,
      STATUS: 'active'
    }
  }
};