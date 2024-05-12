//import { sql } from '@vercel/postgres';
const sql = require('./db.js')
import { Exception, trace, metrics } from "@opentelemetry/api";
import { Resource } from '@opentelemetry/resources';

import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';


const meter = metrics.getMeter('next-app-meter', '0.1.0');
const counter = meter.createCounter('invoice.counter');
const histogram = meter.createHistogram('fetchinvoice.taskduration');


import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  User,
  Revenue,
  Products,
  ProductsTable
} from './definitions';
import { formatCurrency } from './utils';



export async function InvoiceCounterMetrics() {
  try {
    const result = await sql `SELECT count (*) as count FROM invoices`;
    const data = Number(result[0].count);
    counter.add(data, { 'next-app.source.sql.table': 'invoices' });
    return data;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed Create Metrics.');
    
  }
}

export async function fetchProducts(query: string) {
  try {
    const startTime = new Date().getTime();
    

    const data = await sql<Products>
    `SELECT * FROM products WHERE  products.name ILIKE ${`%${query}%`} OR products.description ILIKE ${`%${query}%`}`
    ;
    const endTime = new Date().getTime();
    const executionTime = endTime - startTime;
    histogram.record(executionTime);
    return data;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch products.');
  }
}

export async function fetchFilteredProducts(
  query: string,
  currentPage: number,
) {
  return await trace
  .getTracer("FetchFilteredProducts")
  .startActiveSpan("FetchFilteredProducts", 
   async (span) => {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  try {
    const products = await sql<ProductsTable[]>`
      SELECT
      products.id,
      products.name,
      products.price,
      products.description,
      products.stock,
      products.image_url
      FROM products
      WHERE
      products.name ILIKE ${`%${query}%`} OR
      products.description ILIKE ${`%${query}%`}
      ORDER BY products.name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    //console.log('Invoices:', invoices);
    span.setAttribute("invoiceapp.TotalNumberof.Products", products.length);
    return products;

  } catch (error) {
    const exceptionError = error as Exception;
    span.recordException(exceptionError);
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
  finally {
    span.end();
  }
}
);
}



export async function fetchRevenue() {

  // Add noStore() here to prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  return await trace
  .getTracer("fetchRevenue")
  .startActiveSpan("fetchRevenue", 
   async (span) => {
  try {

    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    // console.log('Fetching revenue data...');
     await new Promise((resolve) => setTimeout(resolve, 3000));


    const data = await sql<Revenue>`SELECT * FROM revenue`;
    const totalRevenue = await sql`SELECT SUM(amount) FROM invoices`;
    
    
    console.log('Data fetch completed after 3 seconds.');
    //console.log('Data fetch completed after 3 seconds.');
    span.setAttribute("invoiceapp.Total.Revenue", totalRevenue[0].sum);
    //span.setAttribute("RevenueData", data);
    span.addEvent("Data fetch completed after 3 seconds.");
    //console.log('Data:', data)
    console.log('Total Revenue:', totalRevenue[0].sum);
    return data;
    
  } catch (error) {
    const exceptionError = error as Exception;
    span.recordException(exceptionError);
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
  finally {
    span.end();
  }
});
}

export async function fetchLatestInvoices() {
  return await trace
  .getTracer("fetchLatestInvoices")
  .startActiveSpan("fetchLatestInvoices", 
  async (span) => {
    try {
      const data = await sql<LatestInvoiceRaw>`
        SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
        FROM invoices
        JOIN customers ON invoices.customer_id = customers.id
        ORDER BY invoices.date DESC
        LIMIT 5`;

      const latestInvoices = data.map((invoice: { amount: number; }) => ({
        ...invoice,
        amount: formatCurrency(invoice.amount),
      }));
      span.setAttribute("invoiceapp.service.name", "LatestInvoices");
      return latestInvoices;  
    } catch (error) {
      const exceptionError = error as Exception;
      span.recordException(exceptionError);
      console.error('Database Error:', error);
      throw new Error('Failed to fetch the latest invoices.');
    }
    finally {
      span.end();
    }
  });
}


export async function fetchCardData() {
  return await trace
  .getTracer("fetchCardData")
  .startActiveSpan("fetchCardData", 
   async (span) => {
  try {

    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);
    
    //const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
    //const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
    //const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
    //const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');
    //console.log('Data:', data[0]);
    const numberOfInvoices = Number(data[0][0].count ?? '0');
    const numberOfCustomers = Number(data[1][0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2][0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2][0].pending ?? '0');
    span.setAttribute("invoiceapp.numberOf.Invoices", numberOfInvoices);
    span.setAttribute("invoiceapp.numberOf.Customers", numberOfCustomers);
    span.setAttribute("invoiceapp.total.PaidInvoices", totalPaidInvoices);
    span.setAttribute("invoiceapp.total.PendingInvoices", totalPendingInvoices);
    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    }
  } catch (error) {
    const exceptionError = error as Exception;
    span.recordException(exceptionError);
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
    
  }
  finally {
    span.end();
  }
});
}

const ITEMS_PER_PAGE = 20;

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  return await trace
  .getTracer("fetchFilteredInvoices")
  .startActiveSpan("fetchFilteredInvoices", 
   async (span) => {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  try {
    const invoices = await sql<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
    //console.log('Invoices:', invoices);
    span.setAttribute("invoiceapp.TotalNumberof.Invoices", invoices.length);
    return invoices;

  } catch (error) {
    const exceptionError = error as Exception;
    span.recordException(exceptionError);
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
  finally {
    span.end();
  }

});
}

export async function fetchInvoicesPages(query: string) {
  return await trace
  .getTracer("fetchInvoicesPages")
  .startActiveSpan("fetchInvoicesPages", 
   async (span) => {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count[0].count) / ITEMS_PER_PAGE);
    //console.log('Total Pages:',  totalPages.toString());
    //span.setAttribute("TotalPages", totalPages);
    return totalPages;

  } catch (error) {
    const exceptionError = error as Exception;
    span.recordException(exceptionError);
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
  finally {
    span.end();
  }
});
}

export async function fetchProductPages(query: string) {
  return await trace
  .getTracer("fetchProductPages")
  .startActiveSpan("fetchProductPages", 
   async (span) => {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM products
  `;

    const totalPages = Math.ceil(Number(count[0].count) / ITEMS_PER_PAGE);
    //console.log('Total Pages:',  totalPages.toString());
    //span.setAttribute("TotalPages", totalPages);
    return totalPages;

  } catch (error) {
    const exceptionError = error as Exception;
    span.recordException(exceptionError);
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
  finally {
    span.end();
  }
});
}

export async function fetchInvoiceById(id: string) {
  return await trace
  .getTracer("fetchInvoiceById")
  .startActiveSpan("fetchInvoiceById", 
   async (span) => {
  try {
    
    const data = await sql<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.map((invoice: { amount: number; }) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));
    span.setAttribute("invoiceapp.Invoice.Amount", invoice.amount);
    console.log(invoice); // Invoice is an empty array []
    return invoice[0];
  } catch (error) {
    const exceptionError = error as Exception;
    span.recordException(exceptionError);
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
  finally {
    span.end();
  }
});
}

export async function fetchCustomers() {
  try {
    const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    const customers = data;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.map((customer: { total_pending: number; total_paid: number; }) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function getUser(email: string) {
  try {
    const user = await sql`SELECT * FROM users WHERE email=${email}`;
    return user[0] as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
