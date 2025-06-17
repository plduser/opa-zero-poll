export interface PermissionChangeRecord {
  id: string
  documentId: string
  documentName: string
  documentType: string
  userId: string
  userName: string
  userType: "user" | "group"
  changeType: "add" | "remove" | "modify"
  permissionType: "read" | "write" | "manage"
  oldValue: boolean
  newValue: boolean
  changedBy: string
  changedAt: Date
}

export interface PermissionHistoryState {
  records: PermissionChangeRecord[]
  loading: boolean
  error: string | null
}
