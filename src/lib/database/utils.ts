/**
 * Common where clause for records with user ownership
 * Soft delete filtering is automatic, no need to add deletedAt
 */
export const userRecords = (userId: string) => ({
  createdBy: userId,
});
