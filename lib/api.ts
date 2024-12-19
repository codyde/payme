export async function getInvoices() {
  const response = await fetch(`/api/invoices`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }

  return response.json();
}

export async function updateInvoice(id: string, data: Partial<Invoice>) {
  const response = await fetch(`/api/invoices/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update invoice');
  }

  return response.json();
}

export async function deleteInvoice(id: string) {
  const response = await fetch(`/api/invoices/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete invoice');
  }

  return response.json();
}

export async function completeInvoice(id: string) {
  const response = await fetch(`/api/invoices/${id}/complete`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to complete invoice');
  }

  return response.json();
}