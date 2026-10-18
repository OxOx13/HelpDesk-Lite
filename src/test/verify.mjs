import assert from 'node:assert';
import { 
  isValidTicket, 
  isValidMessage, 
  mergeDemoData, 
  StorageError 
} from '../services/storage.ts';
import { DEMO_TICKETS, DEMO_MESSAGES } from '../data/demoData.ts';

console.log('=== HELPDESK LITE INTEGRATION & LOGIC TEST SUITE ===');

// Test 1: Ticket Validation
console.log('\n[1] Testing Ticket Validation...');
const sampleValidTicket = {
  id: 'HD-1001',
  customerName: 'Alice Smith',
  customerEmail: 'alice@example.com',
  subject: 'Cannot login to account',
  description: 'Password reset link is expired upon receipt.',
  category: 'Technical',
  priority: 'High',
  status: 'Open',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

assert.strictEqual(isValidTicket(sampleValidTicket), true, 'Valid ticket should pass validation');
assert.strictEqual(isValidTicket({ ...sampleValidTicket, customerEmail: 'not-an-email' }), false, 'Invalid email should fail');
assert.strictEqual(isValidTicket({ ...sampleValidTicket, priority: 'UltraHigh' }), false, 'Invalid priority should fail');
assert.strictEqual(isValidTicket({ ...sampleValidTicket, status: 'Draft' }), false, 'Invalid status should fail');
assert.strictEqual(isValidTicket(null), false, 'Null should fail');
console.log('✔ Ticket schema validation passed.');

// Test 2: Message Validation
console.log('\n[2] Testing Message Validation...');
const sampleReply = {
  id: 'msg-1',
  ticketId: 'HD-1001',
  type: 'reply',
  author: 'Support Agent',
  authorRole: 'agent',
  body: 'We sent a new reset token to your email.',
  createdAt: new Date().toISOString(),
};

const sampleNote = {
  id: 'msg-2',
  ticketId: 'HD-1001',
  type: 'note',
  author: 'Security Ops',
  authorRole: 'agent',
  body: 'Audit verified user identity.',
  createdAt: new Date().toISOString(),
};

assert.strictEqual(isValidMessage(sampleReply), true, 'Valid reply should pass validation');
assert.strictEqual(isValidMessage(sampleNote), true, 'Valid internal note should pass validation');
assert.strictEqual(isValidMessage({ ...sampleNote, type: 'secret_leak' }), false, 'Invalid type should fail');
assert.strictEqual(isValidMessage({ ...sampleNote, authorRole: 'admin' }), false, 'Invalid role should fail');
console.log('✔ Message schema validation passed.');

// Test 3: Safe Demo Data Merge (Non-Destructive)
console.log('\n[3] Testing Non-Destructive Demo Data Loader...');
// Case A: Empty storage
const initialMerge = mergeDemoData([], []);
assert.strictEqual(initialMerge.addedTicketsCount, DEMO_TICKETS.length, 'Should add all demo tickets on empty storage');
assert.strictEqual(initialMerge.addedMessagesCount, DEMO_MESSAGES.length, 'Should add all demo messages on empty storage');

// Case B: Existing user ticket with modified demo ticket and user custom ticket
const userCustomTicket = {
  id: 'HD-9999',
  customerName: 'Custom User',
  customerEmail: 'custom@user.com',
  subject: 'Custom user ticket',
  description: 'This is a personal ticket created by the user.',
  category: 'Billing',
  priority: 'Low',
  status: 'Open',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const userModifiedDemoTicket = {
  ...DEMO_TICKETS[0],
  status: 'Resolved', // User marked demo ticket as resolved
  subject: 'MODIFIED BY USER',
};

const secondMerge = mergeDemoData(
  [userCustomTicket, userModifiedDemoTicket],
  []
);

assert.strictEqual(secondMerge.newTickets.length, DEMO_TICKETS.length + 1, 'Total tickets should be demo tickets + 1 custom user ticket');
const preservedModified = secondMerge.newTickets.find(t => t.id === DEMO_TICKETS[0].id);
assert.strictEqual(preservedModified.subject, 'MODIFIED BY USER', 'Existing ticket was NOT overwritten by demo data');
assert.strictEqual(preservedModified.status, 'Resolved', 'Existing status was NOT overwritten');
const customPresent = secondMerge.newTickets.find(t => t.id === 'HD-9999');
assert.ok(customPresent, 'User custom ticket HD-9999 was preserved');
console.log('✔ Non-destructive demo data merge verified: existing tickets and modifications preserved.');

// Test 4: StorageError class
console.log('\n[4] Testing StorageError handling...');
const quotaErr = new StorageError('Storage quota exceeded');
assert.strictEqual(quotaErr.name, 'StorageError');
assert.strictEqual(quotaErr.message, 'Storage quota exceeded');
console.log('✔ StorageError behavior verified.');

// Test 5: Filter & Search logic verification
console.log('\n[5] Testing Search & Filter Logic...');
const testTickets = [
  ...DEMO_TICKETS,
  userCustomTicket
];

// Search "Okta"
const oktaSearch = testTickets.filter(t => 
  t.subject.toLowerCase().includes('okta') || t.description.toLowerCase().includes('okta')
);
assert.strictEqual(oktaSearch.length, 1, 'Search for Okta should match HD-1004');
assert.strictEqual(oktaSearch[0].id, 'HD-1004');

// Status filter: "Resolved"
const resolvedTickets = testTickets.filter(t => t.status === 'Resolved');
assert.strictEqual(resolvedTickets.length, 2, 'Should match 2 demo resolved tickets');

// Priority filter: "High"
const highTickets = testTickets.filter(t => t.priority === 'High');
assert.strictEqual(highTickets.length, 3, 'Should match 3 demo high priority tickets');

// Sort: Newest first
const sortedNewest = [...testTickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
assert.ok(new Date(sortedNewest[0].createdAt) >= new Date(sortedNewest[1].createdAt), 'First item must be newer than second');

console.log('✔ Search, filtering, and sorting algorithms verified.');

console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===\n');
