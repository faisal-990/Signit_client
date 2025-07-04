// Mock user data
export const mockUser = {
  id: 'user1',
  name: 'Alice',
  email: 'alice@example.com',
}

// Mock documents
export const mockDocuments = [
  {
    id: 'doc1',
    name: 'NDA.pdf',
    uploadedAt: '2024-07-01',
    status: 'pending',
    url: '/sample.pdf', // Place a sample PDF in public/
  },
  {
    id: 'doc2',
    name: 'Contract.pdf',
    uploadedAt: '2024-06-28',
    status: 'signed',
    url: '/sample.pdf',
  },
]

// Mock signatures
export const mockSignatures = [
  {
    documentId: 'doc1',
    userId: 'user1',
    x: 120,
    y: 330,
    page: 1,
    status: 'pending',
  },
  {
    documentId: 'doc2',
    userId: 'user1',
    x: 200,
    y: 400,
    page: 1,
    status: 'signed',
  },
]

// Mock audit trail
export const mockAudit = [
  {
    documentId: 'doc1',
    action: 'uploaded',
    user: 'Alice',
    timestamp: '2024-07-01T10:00:00Z',
    ip: '192.168.1.1',
  },
  {
    documentId: 'doc2',
    action: 'signed',
    user: 'Alice',
    timestamp: '2024-06-28T15:30:00Z',
    ip: '192.168.1.1',
  },
] 